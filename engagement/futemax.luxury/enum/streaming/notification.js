document.addEventListener('DOMContentLoaded', function() {
    const notification = document.querySelector('.notification-bar');
    if (!notification) return;

    // Add padding to body
    document.body.classList.add('has-notification');

    // Check if notification was previously dismissed
    const isDismissed = localStorage.getItem('notificationDismissed');
    if (isDismissed === 'true') {
        notification.classList.add('dismissed');
        document.body.classList.remove('has-notification');
        return;
    }

    // Handle close button
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            notification.classList.add('dismissed');
            document.body.classList.remove('has-notification');
            localStorage.setItem('notificationDismissed', 'true');
        });
    }

    // Auto-dismiss functionality
    const duration = parseInt(notification.dataset.duration, 10);
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('dismissed');
            document.body.classList.remove('has-notification');
            localStorage.setItem('notificationDismissed', 'true');
        }, duration * 1000);
    }

    // Clear dismissed state at midnight
    const clearDismissedState = () => {
        const now = new Date();
        const night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // tomorrow
            0, 0, 0 // midnight
        );
        const msToMidnight = night.getTime() - now.getTime();

        setTimeout(() => {
            localStorage.removeItem('notificationDismissed');
            // Set up next midnight clear
            clearDismissedState();
        }, msToMidnight);
    };
    clearDismissedState();
});
