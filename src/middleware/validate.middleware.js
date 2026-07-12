const { ValidationError } = require('../common/exceptions');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      // Replace req objects with validated data
      req.body = parsedData.body;
      req.query = parsedData.query;
      req.params = parsedData.params;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const issues = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new ValidationError(`Validation failed: ${issues}`));
      } else {
        next(error);
      }
    }
  };
};

module.exports = validate;
