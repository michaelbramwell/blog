var search = search || {};

(function(o, win) {
    
    let _idxOf = function(needle){
        return function(haystack){
            return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
        };
    };

    let _dateFmt = function(dateStr) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString("en-US", options);
    };

    let _client = document.getElementById("client");
    let _server = document.getElementById("server");

    o.init = function(searchTerm) {

        if(searchTerm === '') {
            _client.style.display = 'none';
            _server.style.display = 'block';
            return false;
        }

        let xhr = new XMLHttpRequest();
        
        xhr.open('GET', '/index.xml');
        xhr.setRequestHeader('Content-Type', 'application/xml');
        
        xhr.onload = function() {
            let results = [];
            
            if (xhr.status === 200) {
                results = o.resultToCollection(o.parseXml(xhr.responseText).getElementsByTagName("item"));
            }

            let filtered = o.query(results, searchTerm);

            o.render(filtered);
        };

        xhr.send();
    };

    o.render = function(filtered){
    
        if(filtered.length === 0) {
            _client.style.display = 'none';
            _server.style.display = 'block';
            return;
        }

        _client.style.display = 'block';
        _server.style.display = 'none';

        let templ = '<li class="post-item"><span class="meta">{{pubDate}}</span><a href="{{link}}"><span>{{title}}</span></a></li>';

        let resultsView = filtered.reduce(function(acc, item){
            let s = templ.replace('{{pubDate}}', item.pubDate);
            s = s.replace('{{link}}', item.link);
            
            return acc += s.replace('{{title}}', item.title)
        }, "");

        client.innerHTML = resultsView;
    };

    o.query = function(results, searchTerm){        
        let filtered = results.filter(function(item){
            let f = _idxOf(searchTerm);
            return f(item.title) || f(item.descr) || f(item.link) || f(item.pubDate);
        });

        return filtered;
    };

    o.resultToCollection = function(items) {
        
        let results = Array.prototype.map.call(items, function(item){
            let titleNode = item.getElementsByTagName("title")[0].firstChild || null;

            return {
                title: (titleNode) ? titleNode.nodeValue : "",
                link: item.getElementsByTagName("link")[0].firstChild.nodeValue,
                descr: item.getElementsByTagName("description")[0].firstChild.nodeValue,
                pubDate: _dateFmt(item.getElementsByTagName("pubDate")[0].firstChild.nodeValue)
            };
        });

        return results;
    };

    o.parseXml = function(xmlStr) {
        return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
    }
    
    // ref - http://underscorejs.org/docs/underscore.html
    o.debounce = function(func, wait, immediate) 
    {
        let timeout, args, context, timestamp, result;

        let later = function() 
        {
            let last = new Date().getTime() - timestamp;

            if (last < wait && last >= 0) 
            {
                timeout = setTimeout(later, wait - last);
            } 
            else 
            {
                timeout = null;
                
                if (!immediate) 
                {
                    result = func.apply(context, args);
                    
                    if (!timeout)
                    {
                        context = args = null;
                    }
                }
            }
        };

        return function() 
        {
            context = this;
            args = arguments;
            timestamp = new Date().getTime();

            let callNow = immediate && !timeout;
            
            if (!timeout)
            {
                timeout = setTimeout(later, wait);
            }

            if (callNow) 
            {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
  };
})(search, window);