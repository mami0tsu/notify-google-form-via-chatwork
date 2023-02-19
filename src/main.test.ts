import { formatDate } from "./main";

describe("formatDate", () => {
  test("正しくフォーマットされているか", () => {
    const date = new Date(2022, 11, 31, 23, 59, 59);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2022/12/31 23:59:59");
  });

  test("パディングが正しくおこなわれているか", () => {
    const date = new Date(2023, 0, 1, 0, 0, 0);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe("2023/01/01 00:00:00");
  });
});
