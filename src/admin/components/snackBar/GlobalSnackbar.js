import { useNewOrderNotifier } from "../../context/snackbar/NewOrderContext";
import Snackbar from "./Snackbar";
import { useNavigate } from "react-router-dom";

const GlobalSnackbar = () => {
    const { notification, closeNotification } = useNewOrderNotifier();
    const navigate = useNavigate();

    return (
        <Snackbar
            open={notification.open}
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
            action={
                notification.action
                    ? {
                        label: notification.action.label,
                        onClick: () => {
                            if (notification.action.navigateTo) {
                                navigate(notification.action.navigateTo, {
                                    state: notification.action.state,
                                });
                            }

                            closeNotification();
                        },
                    }
                    : null
            }
            duration={notification.duration}
        />
    );
};

export default GlobalSnackbar;