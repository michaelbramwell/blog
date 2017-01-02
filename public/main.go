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
