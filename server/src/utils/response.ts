export function success(data: any, message = 'success') {
  return { code: 200, message, data };
}

export function error(code: number, message: string) {
  return { code, message, data: null };
}

export function paginate(list: any[], total: number, page: number, pageSize: number) {
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
