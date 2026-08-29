interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: { credential: string }) => void;
}

interface GoogleIdButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  width?: string;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleIdButtonOptions) => void;
}

interface GoogleIdentityWindow {
  google?: { accounts: { id: GoogleAccountsId } };
}

export function renderGoogleSignInButton(
  container: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
  width?: string,
): void {
  const win = window as unknown as GoogleIdentityWindow;
  const accountsId = win.google?.accounts.id;
  if (!accountsId) {
    throw new Error("Google Identity Services script has not loaded");
  }

  accountsId.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });
  accountsId.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    width,
  });
}
