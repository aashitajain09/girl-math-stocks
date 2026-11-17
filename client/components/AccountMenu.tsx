import { signOut } from "@/app/auth/actions";
import { getCurrentUser } from "@/lib/account";

/** Signed-in name + log out. Reads the session, so it renders inside a Suspense boundary. */
export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  const name = user.displayName || user.email.split("@")[0];
  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-sm text-plum-soft md:inline" title={user.email}>
        Hi, <b className="text-plum">{name}</b>
      </span>
      <form action={signOut}>
        <button type="submit" className="btn btn-ghost px-3 py-1.5 text-xs">
          Log out
        </button>
      </form>
    </div>
  );
}
