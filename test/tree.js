var mdtree = require('../'),
    t = require('tap'),
    util = require('util');

t.test('corrctly finds top level files', function (t) {
  mdtree.build('test/files', function (err, tree) {
    console.log(util.inspect(tree, { depth: null, colors: true }));
    t.notOk(err, 'returns without error.');
    t.ok(tree, 'returns a truthy object');
    t.equal(tree.files.length, 3, 'finds three top level articles');
    t.ok(tree.index, 'finds an index');
    t.end();
  });
});

t.test('corrctly finds foldered files', function (t) {
  mdtree.build('test/files', function (err, tree) {
    t.notOk(err, 'returns without error.');
    t.ok(tree, 'returns a truthy object');
    t.equal(tree.slash['a-folder'].files.length, 2, 'finds two articles in a folder');
    t.end();
  });
});

t.test('builds a flat list of articles', function (t) {
  mdtree.build('test/files', function (err, tree) {
    t.notOk(err, 'returns without error.');
    t.ok(tree, 'returns a truthy object');
    var articles = mdtree.files(tree);
    console.log(util.inspect(articles, { depth: null, colors: true }));
    t.equal(articles.length, 7, 'finds 5 articles');
    t.end();
  });
});