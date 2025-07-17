import { useAppContext } from "@/contexts/AppContext";
import { removeAuthToken } from "@/lib/auth";
import { LayoutIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function AccountMenuDropdown() {
  const { user, isUserLoading } = useAppContext();

  const handleLogout = () => {
    removeAuthToken();
    window.location.href = "/";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <UserIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>
          {user && !isUserLoading && (
            <div className="flex flex-col gap-2 cursor-default">
              <span>{user.email}</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/app" className="flex items-center gap-4">
            <LayoutIcon className="h-4 w-4" />
            App
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/account" className="flex items-center gap-4">
            <SettingsIcon className="h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-4">
          <LogOutIcon className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
