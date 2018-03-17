'use strict';
var CommonStyle = {
	ContentMenu: function(Obj = { 'body': { "opt1": "", "opt2": "realFun" } }) {
		var body = $('body'),
			menu = {};

		var openMenu = (x, y, t) => {
			/*
			 *Esta funcion se encarga de mostrar el menún de acciones,
			 *ya definido en el dom.
			 *int x, y -> Las coordenadas que en que se tiene que crear
			 */
			if (!t) return null;
			$('body').prepend(menu[t]);
			$("#contentMenu").css({ "display": "block", "top": `${y}px`, "left": `${x}px` });
		};
		var cliked = (e) => {
			/*
			 *Se encarga de registrar los clicks que tiene lugar en el escritorio.
			 *Si es con el derecho, llama a openMenu, en caso de ser con el izquierdo
			 *lo oculta, sin necesidad de llamar a otra función que lo haga.
			 *x e y son las coordenadas en las que tiene que aparecer el menú
			 */
			e.stopPropagation();
			// e.preventDefault();
			switch (e.which) {
				case 1:
					return $("#contentMenu").remove();
					break;
				case 2:
					return null;
					break;
				case 3:
					let target = (() => {
						for (let t in menu) {
							let property = t.match(/\W/);
							let join = (property) ? property[0] : "";
							let search = (join === ".") ? "className" : (join === "#") ? "id" : "localName";
							console.log(t)
							if (join + e.currentTarget[search].replace(' ', join).indexOf(t) !== -1)
								return t;
						}
					})();
					return openMenu(e.pageX, e.pageY, target);
					break;
			};
		};
		ContentMenu.updateMenu = (obj = Obj) => {
			for (let t in obj) {
				menu[t] = '<div id="contentMenu" class=shadow><nav><ul>';
				for (let o in obj[t])
					menu[t] += `<li class="options" onClick="${obj[t][o]}()">${o}</li>`;
				menu[t] += '</ul></nav></div>';
			}
		};
		ContentMenu.updateMenu();
		body.on('click', cliked);
		for (let o in Obj) {
			console.log(o);
			body.on('mousedown', o, cliked);
		}
	},
	Modal: {
		Render: function() {
			/*var body = $('body');
			ContentMenu.createModal = () => {
				console.log("me quieren crear :D")
			}
			
			// body.prepend(`<div id="modal" class="shadow">${html}</div>`);*/

		},
		Main: function(html) {
			var sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
			if (!html) return;
			var BrowserWindow = this.BrowserWindow,
				app = this.app,
				fs = require('fs'),
				path = html.split("/").slice(0, -1).join("/") + "/",
				file = '',
				readFiles = (() => {
					/*
					 * Este método se encarga de crear una copia del archivo que se solicita, en /tmp con el html modificado
					 */
					var scripts = {js:[], css:[]},
						finalFile, flags = 0,
						scriptsContents = {js: "", css: ""}
					fs.readFile(__dirname + '/bases/modal.html', 'utf-8', (e, cont) => {
						if (e) return console.error(e);
						finalFile = cont;
						flags++;
					});
					fs.readFile(html, 'utf-8', (e, cont) => {
						if (e) return console.error(e);
						let srcScript = [/<script\s.*(src)=\"(.*)\"(\s.*)*><\/script>/g, /<link\s.*(href)=\"(.*)\"(\s.*)*>/],
							m;
						for (let s of srcScript){
							while ((m = s.exec(cont)) != null) {
								for (let i of m) {
									if (m.indexOf(i) === 0) {
										cont = cont.replace(i, "");
									}
									if (i === "src")
										scripts["js"].push(m[m.indexOf(i) + 1]);
									else if(i === "href")
										scripts["css"].push(m[m.indexOf(i) + 1]);
								}
							}
						}
						for (var i in scripts){
							for (let s of scripts[i]) {								
								s = s.replace(/^\.\//, "")
								fs.readFile(path + s, 'utf-8', (e, c) => {									
									scriptsContents[s.split(".").slice(-1)] += c;
									flags++;
									if (flags === 2 + scripts["js"].length+ scripts["css"].length) {
										return writeFile(finalFile, cont, scriptsContents)
									}
								});
							}
						}
					});
					flags++;
				})(),
				ready = 1,
				replace = (obj, str, clean) =>{
					return(() => {
					var match, rpl, ret, i = 0, regex = /#{(\w*)(\[(\d+|"\w+")])?}/g;
						while ((match = regex.exec(str)) != null ) {						
							rpl = (()=>{								
								if (!obj[match[1]])return ""								
								else if (match[3]) return obj[match[1]][match[3]];								
								else return obj[match[1]];
							})();
							str = (obj[match[1]] || clean) ? str.replace(match[0], rpl) : str;
						}
						return str;
					})();
				},
				writeFile = (total, content, src) => {
					/*
					 *Encargado de generar un único archivo con la base del resto
					 */
					let toReplace = {
						"content": content,
						"js": src.js,
						"css": src.css
					};
					file = replace(toReplace, total);
					fs.writeFile("/tmp/modal.html", file, (e) =>{ready++;console.log("ready[write modal]: "+ready)});
				},
				searchResource = (file) =>{
					/*
					 * Función encargada de buscar los require que se pidan y adaptarlos a la
					 * nueva ruta.
					 * Si empieza en "./" se toma la desde la ubicación del archivo, en caso contrario
					 * desde aquí (módulos generales)
					*/
					
					let pat = /require\('(.*)'\)/g, m, path = __dirname.split("/").slice(0, -1).join("/")+"/";					
					while ((m = pat.exec(file)) != null){
						if (m[1].search("./") == 1){ //Se esta buscando desde la ubicación del archivo
							console.log(m[1]);
						}
						file = file.replace(m[1], path+m[1])						
					};
					return file/*.replace(/\n|\t/g, '');*/

				};
			this.createModal = async function(obj) {
				let name ='';
				while (ready!==2){await sleep(5);}
				console.log("Voy a  leer el archivo")
				fs.readFile("/tmp/modal.html", "UTF-8", (e, c) =>{
					if (e) return console.error(e);
					c = replace(obj, c);
					c = searchResource(c);
					let l = new Date();
					name = `${l.getHours()}_${l.getMinutes()}_${l.getSeconds()}_${l.getMilliseconds()}.html`;
					fs.writeFile("/tmp/"+name, c, (e) => {
						if (e) return console.error(e);
						console.log("ya se ha creado el archivo con el nombre "+name )
						ready++;
					});
				});
				while (ready!==3){await sleep(5);}				
				console.log("Voy a crear la ventana para el archivo: " + name)
				let win = new this.BrowserWindow({ width: 400, height: 300, menu: false });
				win.loadURL("file:///tmp/"+name);
				win.webContents.openDevTools();
				win.on('closed', () => { win = null });
			};
		}
	}
};
module.exports = exports = CommonStyle;