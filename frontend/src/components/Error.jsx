import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export function setError(message) {
    if (!message) return;
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
    });
}
