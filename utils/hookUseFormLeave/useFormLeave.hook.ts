import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export const useFormLeave = (isDirty: boolean) => {
	const router = useRouter();

	const [showLeaveModal, setShowLeaveModal] = useState(false);
	const [pathname, setPathname] = useState<string | null>(null);
	const lastHistoryState = useRef<{ key: number }>(global.history?.state);

	const handleUserChoice = useCallback(
		(leave: boolean) => async () => {
			
			setShowLeaveModal(false);
			if (!leave) {
				setPathname(null);				
				return;
			}

			router.events.off("routeChangeStart", onRouteChangeStart);
			window.removeEventListener("beforeunload", handler);		

			if (pathname) {
				await router.push(pathname);
			}
		},
		[pathname, router]
	);

	const handler = useCallback(
		(event: BeforeUnloadEvent) => {			
			if (!isDirty) {
				return;
			}

			event.preventDefault();
			return event.returnValue = "Are you sure you want to exit?.";
		},
		[isDirty]
	);

	useEffect(() => {
        const storeLastHistoryState = (): void => {
            lastHistoryState.current = history.state;
        };
        router.events.on("routeChangeComplete", storeLastHistoryState);

        return () => {
            router.events.off("routeChangeComplete", storeLastHistoryState);
        };
    }, [router]);

	/**
     * @experimental HACK - key is not documented
     * Determines which direction to travel in history.
     */
	const revertTheChangeRouterJustMade = useCallback(() => {
		const state = lastHistoryState.current;
		if (state !== null && history.state !== null && state?.key !== history.state?.key) {
			// this only handles the browser back button and needs updated to handle forward button
			// but there is not way to know which button was pressed
			history.forward();
		}
	}, []);

	const onRouteChangeStart = useCallback(
		(newPathname: string) => {

			// When the project is using basepath, it affects the navigation so we could remove the basepath of the url to avoid problems
			const path = (newPathname.startsWith("/assign") ? newPathname.replace("/assign", "") :newPathname) || "/";

			if (!isDirty || router.asPath === path) {
				return;
			}
			
			if(!pathname){
				setPathname(path);
			}
			
			setShowLeaveModal(true);
			router.events.emit('routeChangeError');

			// If we need to prevent navigation on back/forward buttons we need to uncomment this code
			// but there are some weird behaviors when using this buttons so it is better to avoid this.
			// revertTheChangeRouterJustMade();
						
			// eslint-disable-next-line no-throw-literal
			throw '\nRoute change aborted. Please ignore this error';
		},
		[isDirty]
	);

	useEffect(() => {
		router.events.on("routeChangeStart", onRouteChangeStart);
		window.addEventListener("beforeunload", handler);

		router.beforePopState(({ url }) => {
			if (router.asPath !== url && isDirty) {
				router.events.off("routeChangeStart", onRouteChangeStart);
				window.removeEventListener("beforeunload", handler);
			}
		
			// We return true to allow the pop state behavior to continue as expected.
			return true;
		});

		return () => {
			router.events.off("routeChangeStart", onRouteChangeStart);
			window.removeEventListener("beforeunload", handler);
			router.beforePopState(() => true);
		};
	}, [onRouteChangeStart, router.events]);

	return {
		showLeaveModal, 
		handleUserChoice
	};
};