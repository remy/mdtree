var readDir  = require('./readDir'),
    async    = require('async'),
    _        = require('lodash/dist/lodash.underscore'),
    mdrender = require('mdrender');

var renderFile = function (file, cb) {
  mdrender(file.path, cb);
};

var rmUndefined = function (val) { return !!val; };

/**
 * Build a tree of files and directories
 */
exports.build = function buildTree(rootPath, cb) {

  // Read the path to find contained entities
  readDir.read(rootPath, function (err, entities) {
    if (err) return cb(err);

    // Split the entities into files and directories
    var root = readDir.separate(entities);
    var data = { files: [], dirs: [], slash: {} };
    data.name = rootPath.split('/').slice(-1).join('');

    // Render each of the files and save it to the files array
    async.map(root.files, renderFile, function (err, renderedFiles) {
      if (err) return cb(err);

      // Transform the list of rendered files into something useful with
      // file names, paths and a url path.
      data.files = renderedFiles.map(function (file, i) {
        file.fileName = root.files[i].name;
        file.filePath = root.files[i].path;
        file.urlPath = root.files[i].path.replace(/(\/index)?\.[a-z]+$/i, '');
        if (file.fileName.match(/index/i)) {
          data.index = file;
          // Don't include the index in the list of files
          return;
        }
        return file;
      }).filter(rmUndefined);

      // Grab the paths of each of the directories
      var dirNames = _.pluck(root.dirs, 'path');
      // And map over them, building a tree for each.
      async.map(dirNames, buildTree, function (err, subTrees) {

        // Save the trees as an array
        data.dirs = subTrees.map(function (tree) {
          // If the subtree has an index, add it to our outer list of files.
          if (tree.index) {
            data.files.push(tree.index);
          }
          // If there are no files in there, don't include the dir
          if (!tree.files.length) return;
          return tree;
        }).filter(rmUndefined);

        // Add slash object to make testing easier
        data.slash = data.dirs.reduce(function (slash, dir) {
          slash[dir.name] = dir;
          return slash;
        }, {});
        cb(null, data);
      });
    });
  });

};

/**
 * Flatten a tree structure into a list of files
 */
exports.flatten = function flatten(tree) {
  return tree.files.concat.apply(tree.files, tree.dirs.map(flatten));
};
/**
 * Get all the files from a tree
 */
exports.files = function (tree) {
  return [tree.index].concat(exports.flatten(tree)).filter(rmUndefined);
};