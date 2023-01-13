import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

export const useFormLeave = (isDirty: boolean, handleOnOpenModal?: () => void, handleOnCloseModal?: () => void) => {
  const router = useRouter();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pathname, setPathname] = useState<string | null>(null);

  const beforeUnloadHandler = useCallback(
    (event: BeforeUnloadEvent) => {
      console.log("beforeUnloadHandler", isDirty);
      if (!isDirty) {
        return undefined;
      }

      // This will display the default modal of the browser, custom message only works on old browsers
      const message = 'Are you sure you want to exit?';
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      event.returnValue = message;
      return message;
    },
    [isDirty],
  );

  const onRouteChangeStart = useCallback(
    (newPathname: string) => {
      // newPathname has the basePath so we have to remove it to navigate using useRouter
      const path =
        (newPathname.startsWith('/assign') ? newPathname.replace('/assign', '') : newPathname) ||
        '/';

      console.log("onRouteChangeStart", path, isDirty);

      if (!isDirty) {
        return;
      }

      setPathname(path);

      handleOnOpenModal?.();
      setShowLeaveModal(true);
      router.events.emit('routeChangeError');

      // eslint-disable-next-line no-throw-literal
      throw 'Route change aborted. Please ignore this error';
    },
    [isDirty, router.events],
  );

  useEffect(() => {
    router.events.on('routeChangeStart', onRouteChangeStart);
    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    router.beforePopState(({ url }) => {
      if (router.asPath !== url && isDirty) {
        router.events.off("routeChangeStart", onRouteChangeStart);
        window.removeEventListener("beforeunload", beforeUnloadHandler);

        if (window.confirm('Are you sure')) {
          return true
        } else {
          // when back/forward buttons are used, the url is changing before navigation
          // so if the navigation is aborted we have to fix the url
          history.pushState(null, '', url);
          router.replace(router.asPath, router.asPath, { shallow: true });
          return false;
        }
      }
      return true;
    });

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      router.beforePopState(() => true);
    };
  }, [onRouteChangeStart, beforeUnloadHandler, router]);

  /**
   * hides confirmation modal, if the user chooses to leave the page, it will not
   * continue preventing navigation and move the user to the requested page
   */
  const handleUserChoice = useCallback(
    async (leave: boolean) => {
      setShowLeaveModal(false);

      handleOnCloseModal?.();

      if (!leave) {
        setPathname(null);
        return;
      }

      router.events.off('routeChangeStart', onRouteChangeStart);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      if (pathname) {
        await router.push(pathname);
      }
    },
    [pathname, beforeUnloadHandler, onRouteChangeStart, router],
  );

  /**
   * Removes route listeners (routeChangeStart, beforeunload)
   */
  const removeRouteListeners = useCallback(() => {
      router.events.off('routeChangeStart', onRouteChangeStart);
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    },
    [router],
  );

  return {
    showLeaveModal,
    handleUserChoice,
    removeRouteListeners
  };
};
