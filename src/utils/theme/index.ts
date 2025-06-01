export function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "text-red-500"
    case "low":
      return "text-gray-400"
    default:
      return "text-blue-500"
  }
}
