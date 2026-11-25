export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];
export const SORT_FIELDS = ['title', 'author', 'year', 'rating'];
export const ORDERS = ['asc', 'desc'];

export function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkText(value, field) {
  if (typeof value !== 'string') return `"${field}" must be a string`;
  const length = value.trim().length;
  if (length < 1 || length > 100) {
    return `"${field}" must be 1 to 100 characters after trimming`;
  }
  return null;
}

export function validateBook(input) {
  if (!isPlainObject(input)) {
    return { error: 'Request body must be a JSON object' };
  }

  const { title, author, year, genre } = input;
  const read = input.read === undefined ? false : input.read;
  const rating = input.rating === undefined ? null : input.rating;

  const titleError = checkText(title, 'title');
  if (titleError) return { error: titleError };

  const authorError = checkText(author, 'author');
  if (authorError) return { error: authorError };

  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
    return { error: `"year" must be an integer between 1000 and ${currentYear}` };
  }

  if (!GENRES.includes(genre)) {
    return { error: `"genre" must be one of: ${GENRES.join(', ')}` };
  }

  if (typeof read !== 'boolean') {
    return { error: '"read" must be true or false' };
  }

  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { error: '"rating" must be an integer from 1 to 5, or null' };
  }

  if (rating !== null && read !== true) {
    return { error: '"rating" is allowed only when "read" is true' };
  }

  return {
    value: { title: title.trim(), author: author.trim(), year, genre, read, rating },
  };
}

export function pickBookFields(input) {
  const allowed = ['title', 'author', 'year', 'genre', 'read', 'rating'];
  const changes = {};
  for (const key of allowed) {
    if (input[key] !== undefined) changes[key] = input[key];
  }
  return changes;
}

export function validateListQuery(query) {
  const allowed = ['genre', 'read', 'q', 'sort', 'order', 'limit', 'page'];

  for (const key of allowed) {
    if (Array.isArray(query[key])) {
      return { error: `Query parameter "${key}" must not be repeated` };
    }
  }

  const options = {
    genre: null,
    read: null,
    q: '',
    sort: 'id',
    order: 'asc',
    limit: 50,
    page: 1,
  };

  if (query.genre !== undefined) {
    if (!GENRES.includes(query.genre)) {
      return { error: `"genre" must be one of: ${GENRES.join(', ')}` };
    }
    options.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== 'true' && query.read !== 'false') {
      return { error: '"read" must be "true" or "false"' };
    }
    options.read = query.read === 'true';
  }

  if (query.q !== undefined) {
    if (typeof query.q !== 'string') return { error: '"q" must be a string' };
    options.q = query.q.trim().toLowerCase();
  }

  if (query.sort !== undefined) {
    if (!SORT_FIELDS.includes(query.sort)) {
      return { error: `"sort" must be one of: ${SORT_FIELDS.join(', ')}` };
    }
    options.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (!ORDERS.includes(query.order)) {
      return { error: '"order" must be "asc" or "desc"' };
    }
    options.order = query.order;
  }

  if (query.limit !== undefined) {
    const limit = /^\d+$/.test(query.limit) ? Number(query.limit) : NaN;
    if (!(limit >= 1 && limit <= 50)) {
      return { error: '"limit" must be an integer from 1 to 50' };
    }
    options.limit = limit;
  }

  if (query.page !== undefined) {
    const page = /^\d+$/.test(query.page) ? Number(query.page) : NaN;
    if (!(page >= 1)) {
      return { error: '"page" must be an integer of at least 1' };
    }
    options.page = page;
  }

  return { value: options };
}