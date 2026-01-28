import { getUsers } from "@/app/actions/users"
import { UserList } from "./user-list"

export default async function UsersPage() {
  const users = await getUsers()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
      </div>
      <UserList initialUsers={users} />
    </div>
  )
}
