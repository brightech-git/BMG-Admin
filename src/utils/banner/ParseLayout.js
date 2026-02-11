export const parseLayoutString = (layoutStr) => {
  if (!layoutStr || typeof layoutStr !== "string") {
    return { columns: [], rows: "" };
  }

  const columnsMatch = layoutStr.match(/columns=\[([^\]]+)\]/);
  const rowsMatch = layoutStr.match(/rows=(\d+)/);

  return {
    columns: columnsMatch
      ? columnsMatch[1]
          .split(",")
          .map((c) => Number(c.trim()))
      : [],
    rows: rowsMatch ? rowsMatch[1] : "",
  };
};