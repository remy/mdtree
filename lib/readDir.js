var fs = require('fs'),
    async = require('async'),
    path = require('path');

exports.read = function (rootPath, cb) {

  fs.readdir(rootPath, function (err, files) {
    if (err) return cb(err);
    var paths = files.map(function (fileName) {
      return path.join(rootPath, fileName);
    });
    async.map(paths, fs.lstat, function (err, stats) {
      if (err) return cb(err);
      var fileData = files.map(function (fileName, i) {
        return {
          name: fileName,
          path: paths[i],
          stats: stats[i]
        };
      });
      cb(null, fileData);
    });
  });

};

exports.separate = function (data) {
  var files = [],
      dirs = [];
  data.forEach(function (file) {
    if (file.stats.isFile()) return files.push(file);
    if (file.stats.isDirectory()) return dirs.push(file);
  });
  return {
    files: files,
    dirs: dirs
  };
};