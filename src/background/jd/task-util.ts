export async function doTasks<T = any>({
  list,
  handler
}: {
  list: () => Promise<T[]>;
  handler: (item: T) => Promise<any>;
}) {
  let items = await list();
  for (let item of items) {
    await handler(item);
  }
}

export function wrapTasksHandler(data) {
  return () => doTasks(data);
}
