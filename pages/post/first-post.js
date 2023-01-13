import Link from "next/link";
import { useRouter } from "next/router";
import { useFormLeave } from '../../utils/hookUseFormLeave/useFormLeave.hook';

import Dialog from '../../components/dialog/dialog';

export default function FirstPost() {

    const router = useRouter();

    const { showLeaveModal, handleUserChoice } = useFormLeave(true);

    const navigate = () => {
        router.push('/');
    };

    const goBack = () => {
        // router.back();
        history.back();
    };

    const goTo = () => {
        window.location.href = 'http://localhost:3000/assign';
    };

    return <div>
        <h1>First Post </h1>

        <Link href="/" >Your link</Link>

        <button onClick={navigate}>Navigation with button</button>

        <button onClick={goBack}>Navigation back</button>

        <button onClick={goTo}>Navigation href</button>

        {showLeaveModal && <Dialog leaveCallback={handleUserChoice}/>}

    </div>;
  }