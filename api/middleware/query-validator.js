const offsetMin = 0;
const limitMin = 0;
const offsetMax = 1000;
const limitMax = 5;
const defaultLimit = 3;

const normalizeQueryOffset = (offsetStr) => {
  const offset = parseInt(offsetStr, 10);
  if (!isFinite(offset)) {
    return offsetMin;
  }
  return (
    offset >= offsetMin && offset <= offsetMax
      ? offset
      : offsetMin
  );
};

const normalizeQueryLimit = (limitStr) => {
  const limit = parseInt(limitStr, 10);
  if (!isFinite(limit)) {
    return defaultLimit;
  }
  return (
    limit >= limitMin && limit <= limitMax
      ? limit
      : defaultLimit);
};

const normalizeQueryFields = (fields) => {
  if (fields !== undefined) {
    return fields.replace(/,/g, ' ');
  }
  return '';
};

const resolveQuery = (req, res, next) => {
  const { offset, limit, fields } = req.query;
  const resolvedQuery = {
    offset: normalizeQueryOffset(offset),
    limit: normalizeQueryLimit(limit),
    fields: normalizeQueryFields(fields),
  };
  req.Query = resolvedQuery;
  return next();
};

module.exports = resolveQuery;
