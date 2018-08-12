+++
date = "2017-01-03T15:01:31+08:00"
title = "Hugo on App Engine"
tags = [ "dev", "go", "hugo", "themes", "app engine", "blog" "test" ]
+++

Hugo is a good place to start this blog as this site is built on it. [Hugo](https://gohugo.io/) is a static site generator built using [Go language](https://golang.org/). I like Go and the lack of dependency hell that I seemed to experience whenever trying to wrangle with [Jekyll](https://jekyllrb.com/).

I found the Hugo [quick-start](https://gohugo.io/overview/quickstart/) guide was all I needed to help me get up and running. The next step was to choose a theme, this is also a fairly pain free experience and Hugo seems to have a good community producing [plenty of themes](http://themes.gohugo.io/). I ended up choosing [cocoa theme](http://themes.gohugo.io/cocoa/) which is nice and minimal and suitable for my simple blogging needs. I did encounter an error complaining about li.html (I
forget the error details) but overcame this by copying the example site that come with the cocoa theme into the root of my hugo site.

The next step was to get this blog running on [Google App Engine](https://appengine.google.com). There are no doubt numerous ways to do this, I chose to serve my site via a simple Go file that serves the static html generated via _hugo serve_ in the _public/_ directory.

__My Main.go file__

{{< highlight go >}}
package blog

import (
    "net/http"
        ttemplate "text/template"
        )

var htmlTempl = ttemplate.Must(ttemplate.ParseFiles("index.html"))

func init() {
        http.HandleFunc("/", root)
}

func root(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "text/html")
            htmlTempl.Execute(w, "")
}
{{< /highlight >}}

__My app.yaml configuration file ([ref](http://stackoverflow.com/a/5609439))__

{{< highlight YAML >}}
application: blog-xxxx
version: 1
runtime: go
api_version: go1

handlers:

# Handle the main page by serving the index page.
# Note the $ to specify the end of the path, since app.yaml does prefix matching.
- url: /$
  static_files: index.html
  upload: index.html

- url: /$
  static_files: index.xml
  upload: index.xml

- url: /$
  static_files: sitemap.xml
  upload: sitemap.xml

# Handle folder urls by serving the index.html page inside.
- url: /(.*)/$
  static_files: \1/index.html
  upload: .*/index.html

- url: /css/ 
  static_dir: css

# Handle nearly every other file by just serving it.
- url: /(.+)
  static_files: \1
  upload: /(.*)

- url: /.*
  script: _go_app

# Recommended file skipping declaration from the GAE tutorials
skip_files:
  - ^(.*/)?app\.yaml
  - ^(.*/)?app\.yml
  - ^(.*/)?#.*#
  - ^(.*/)?.*~
  - ^(.*/)?.*\.py[co]
  - ^(.*/)?.*/RCS/.*
  - ^(.*/)?\..*
  - ^(.*/)?tests$
  - ^(.*/)?test$
  - ^test/(.*/)?
  - ^COPYING.LESSER
  - ^README\..*
  - \.gitignore
  - ^\.git/.*
  - \.*\.lint$
  - ^fabfile\.py
  - ^testrunner\.py
  - ^grunt\.js
  - ^node_modules/(.*/)?
{{< /highlight >}}

I haven't configured SSL at this stage as using [Let's Encrypt](https://letsencrypt.org/) on App Engine is not the painless experience I expected given Google's recent encouragement of SSL. If I find the time I'll get this running or I'll just wait until App Engine incorporates Let's Encrypt as a built in offering which is apparently coming soon.

The code repository for this site can be found [here](https://github.com/michaelbramwell/blog).
