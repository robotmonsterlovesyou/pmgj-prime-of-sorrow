serve:
	(cd static/ && python -m SimpleHTTPServer)

deploy:
	rm -rf dist/
	cp -r static/ dist/

	./node_modules/.bin/r.js -o dist/build.config.js

	rm -rf dist/bower_components/
	rm -rf dist/js/
	rm dist/build.config.js

	mkdir dist/js
	mv dist/js-build/config.js dist/js/build.min.js

	rm dist/index.html
	mv dist/index-dist.html dist/index.html

	rm -rf dist/js-build/

	git add dist && git commit -m "Deployed game to gh-pages."
	git subtree push --prefix dist origin gh-pages
	git reset --hard HEAD~1
