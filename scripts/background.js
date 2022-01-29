document.addEventListener("DOMContentLoaded", function () {
    document.querySelector('#btn').addEventListener('click', function () {
        // LOADING
        document.getElementById('loading').classList.add('active');

        // GET TAB ID
        chrome.tabs.query({
            active: true
        }, function (tabs) {
            console.log(tabs);

            // START SCRIPT
            chrome.tabs.executeScript(tabs[0].id, {
                code: `
                    console.log('TESTE')
                    document.querySelector('meta[property="product:sku"]') ? 'skuId:' + document.querySelector('meta[property="product:sku"]').getAttribute('content') : 'productId:' + document.getElementById('___rc-p-id').getAttribute('value')
                `,
            }, function (results) {
                let htmlContent = results[0];

                let url = tabs[0].url.split('/')[2];

                fetch('https://' + url + '/api/catalog_system/pub/products/search?fq=' + htmlContent, {
                        method: 'GET',
                    })
                    .then(res => res.json())
                    .then(json => {
                        let all = json[0];

                        let categories = all.categories;
                        let specifications = all.allSpecifications;
                        let cluster_hilights = all.clusterHighlights;

                        console.log(all);

                        // BASIC INFO
                        Object.entries(all).forEach(([key, value]) => {
                            if (document.getElementById(key) && document.getElementById(key).nodeName === 'INPUT') {
                                document.getElementById(key).value = value;
                            }
                        });

                        // CATEGORIES
                        categories.forEach(function (item, index) {
                            let li = document.createElement('li');
                            let div = `
                                <span>Categoria (${index}):</span>
                                <a href="https://${url}${item}" target="_blank" title="${item}">${item}</a>
                            `
                            li.innerHTML = div;

                            document.getElementById('categories').appendChild(li);
                        });

                        function build(elementId, name, list) {
                            console.log(typeof list);

                            Object.entries(list).forEach(function (item, index) {
                                console.log('allSpecifications', item, index);

                                let li = document.createElement('li');
                                let div = `
                                    <span>${name} (${index}):</span>
                                    <input type="text" value="${item[1]}" readonly />
                                `
                                li.innerHTML = div;

                                document.getElementById(elementId).appendChild(li);
                            });
                        }

                        build('allSpecifications', 'Especificação', specifications);
                        build('clusterHighlights', 'Coleções em Destaque', cluster_hilights);

                        // REMOVE LOADING
                        document.getElementById('loading').classList.remove('active');
                    });
            });
        });
    });
});