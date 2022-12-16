import Router, { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";

export const useWarnIfUnsaved = (unsavedChanges: boolean, callback: () => boolean) => {

  const router = useRouter();
  const currentPath = router.asPath;
  const nextPath = useRef('');

  const killRouterEvent = useCallback(() => {
    router.events.emit('routeChangeError')
    throw 'route cancelled';
  }, [router])

  useEffect(() => {
    console.log("useWarnIfUnsaved1");
    if (unsavedChanges) {
      console.log("useWarnIfUnsaved2");
      const routeChangeStart = () => {
        console.log("useWarnIfUnsaved3");
        const ok = callback();
        if (!ok) {
          console.log("useWarnIfUnsaved4");
          //callback();
          console.log("Show confirmation modal");
          killRouterEvent();
        }
      }
      console.log("ON routeChangeStart");
      Router.events.on("routeChangeStart", routeChangeStart)

      return () => {
        console.log("OFF routeChangeStart");
        Router.events.off("routeChangeStart", routeChangeStart)
      }
    }
  }, [unsavedChanges])
}
