import { Router, useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

const useBeforeUnload = (enabled: boolean) => {
	const handler = useCallback(
		(event: BeforeUnloadEvent) => {			
			if (!enabled) {
				return;
			}
			console.log("BeforeUnloadEvent", event);

			event.preventDefault();
			return event.returnValue = "Are you sure you want to exit?";
		},
		[enabled]
	);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		window.addEventListener("beforeunload", handler);

		return () => window.removeEventListener("beforeunload", handler);
	}, [enabled, handler]);
};


export const useFormLeave = (isDirty: boolean) => {
	const router = useRouter();

	const [showLeaveModal, setShowLeaveModal] = useState(false);
	const [pathname, setPathname] = useState<string | null>(null);

	const getWindow = (): Window | null => (typeof window !== 'undefined' ? window : null);
	const getHistory = () => getWindow()?.history?.state;
	const lastHistory = useRef(getHistory());

	useEffect(() => {
		const storeLastHistoryState = () => {
		  lastHistory.current = getHistory();
		};
		router.events.on('routeChangeComplete', storeLastHistoryState);
		return () => {
		  router.events.off('routeChangeComplete', storeLastHistoryState);
		};
	  }, [router]);

	useBeforeUnload(isDirty);


    /**
     * @experimental HACK - idx is not documented
     * Determines which direction to travel in history.
     */
	 const revertTheChangeRouterJustMade = useCallback(() => {
        const state = lastHistory.current
        if (
            state !== null &&
            history.state !== null &&
            state.idx !== history.state.idx
        ) {
            const delta = lastHistory.current.idx < history.state.idx ? -1 : 1
            history.go(delta)
        }
    }, [])

	const onRouteChangeStart = useCallback(
		(pathname: string) => {
			console.log("onRouteChangeStart", pathname);
			if (!isDirty) {
				return;
			}

			setShowLeaveModal(true);
			router.events.emit('routeChangeError');
			revertTheChangeRouterJustMade();
			setPathname(pathname);			
			throw "\nRoute change aborted. Please ignore this error";
		},
		[isDirty]
	);

	const removeRouteChangeStart = useCallback(() => router.events.off("routeChangeStart", onRouteChangeStart), [router.events, onRouteChangeStart]);

	const handleUserChoice = useCallback(
		(leave: boolean) => async () => {
			setShowLeaveModal(false);

			if (!leave) {
				setPathname(null);
				return;
			}

			removeRouteChangeStart();

			if (pathname) {
				await router.push(pathname);
			}
		},
		[pathname, removeRouteChangeStart, router]
	);

	useEffect(() => {
		router.events.on("routeChangeStart", onRouteChangeStart);

		return removeRouteChangeStart;
	}, [onRouteChangeStart, removeRouteChangeStart, router.events]);

	return {
		showLeaveModal, 
		handleUserChoice
	};
};