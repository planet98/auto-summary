export const onRequestPost = async (context: any) => {
  // 转发给 JS 逻辑，确保一致性
  const { onRequestPost } = await import("./summarize.js");
  return onRequestPost(context);
};