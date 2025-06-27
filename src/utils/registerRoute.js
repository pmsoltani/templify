import catchAsync from "./catchAsync.js";

/**
 * A generic helper to register a route on a given router.
 * It maps over all handlers and wraps any function in the catchAsync utility.
 * @param {import('express').Router} router - The Express router instance.
 * @param {'get' | 'post' | 'put' | 'patch' | 'delete'} method - The HTTP method.
 * @param {string} path - The route path.
 * @param  {...Function} handlers - A chain of middleware and the final controller.
 */
const registerRoute = (router, method, path, ...handlers) => {
  const wrapped = handlers.map((h) => (typeof h === "function" ? catchAsync(h) : h));
  router[method](path, ...wrapped);
};

export default registerRoute;
