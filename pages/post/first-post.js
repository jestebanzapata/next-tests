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

    return <div>
        <h1>First Post </h1>

        <Link href="/">Navigation with link</Link>

        <button onClick={navigate}>Navigation with button</button>


        {showLeaveModal && <Dialog leaveCallback={handleUserChoice}/>}

    </div>;
  }