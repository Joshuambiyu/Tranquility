if (!localStorage.getItem("oneTapDismissed")) {
  authClient.oneTap({
    callbackURL: window.location.href,
    onDismiss: () => {
      localStorage.setItem("oneTapDismissed", "true");
    },
  });
}