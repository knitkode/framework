const define = /\<\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\>/g;
const defineParams = /^\s*([\w$]+):([\s\S]+)/;
const evaluate = /\<\%([\s\S]+?(\}?)+)\%\>/g;
const interpolate = /\<\%=([\s\S]+?)\%\>/g;
const encode = /\<\%!([\s\S]+?)\%\>/g;
const use = /\<\%#([\s\S]+?)\%\>/g;
const useParams =
  /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g;
const conditional = /\<\%\?(\?)?\s*([\s\S]*?)\s*\%\>/g;
const iterate =
  /\<\%~\s*(?:\%\>|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\>)/g;
const varname = "data";
const strip = true;
const append = true;

const startend = {
    append: { start: "'+(", end: ")+'", startencode: "'+encodeHTML(" },
    split: {
      start: "';out+=(",
      end: ");out+='",
      startencode: "';out+=encodeHTML(",
    },
  },
  skip = /$^/;

function resolveDefs(block, def) {
  return (typeof block === "string" ? block : block.toString())
    .replace(define || skip, function (m, code, assign, value) {
      if (code.indexOf("def.") === 0) {
        code = code.substring(4);
      }
      if (!(code in def)) {
        if (assign === ":") {
          if (defineParams)
            value.replace(defineParams, function (m, param, v) {
              def[code] = { arg: param, text: v };
            });
          if (!(code in def)) def[code] = value;
        } else {
          new Function("def", "def['" + code + "']=" + value)(def);
        }
      }
      return "";
    })
    .replace(use || skip, function (m, code) {
      if (useParams)
        code = code.replace(useParams, function (m, s, d, param) {
          if (def[d] && def[d].arg && param) {
            var rw = (d + ":" + param).replace(/'|\\/g, "_");
            def.__exp = def.__exp || {};
            def.__exp[rw] = def[d].text.replace(
              new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"),
              "$1" + param + "$2"
            );
            return s + "def.__exp['" + rw + "']";
          }
        });
      var v = new Function("def", "return " + code)(def);
      return v ? resolveDefs(v, def) : v;
    });
}

function unescape(code) {
  return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
}

/**
 * Returns the rendered template as a string
 */
type renderFunction<T> = (data: renderData<T>) => string;

/**
 * Default render function creator
 */
type renderTemplate<T> = (template: string) => renderFunction<T>;

/**
 * Returns the rendered template as a string
 */
type renderData<T> = { data: T };

/**
 * Render template (adapted from doT.js)
 *
 * The data made avialable to the template is always on the `data` key, e.g.:
 * `renderFunction({ myVal: "xx" })`
 * ... will be accessible on
 * `<%= data.myVal %>`
 *
 * The default delimiters are customised to work without conflicts with Twig:
 * ```
 * <% %>	for evaluation
 * <%= %>	for interpolation
 * <%! %>	for interpolation with encoding
 * <%# %>	for compile-time evaluation/includes and partials
 * <%## #%>	for compile-time defines
 * <%? %>	for conditionals
 * <%~ %>	for array iteration
 * ```
 *
 * @license
 * doT.js 2011-2014, Laura Doktorova, https://github.com/olado/doT
 * Licensed under the MIT license.
 * @see https://olado.github.io/doT/index.html
 */
export default function render<Data extends Record<string, any>>(
  tmpl: string,
  def: object
): renderTemplate<Data> {
  let cse = append ? startend.append : startend.split,
    sid = 0,
    indv,
    functionBody = use || define ? resolveDefs(tmpl, def || {}) : tmpl;

  functionBody = (
    "var out='" +
    (strip
      ? functionBody
          .replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ")
          .replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "")
      : functionBody
    )
      .replace(/'|\\/g, "\\$&")
      .replace(interpolate || skip, function (m, code) {
        return cse.start + unescape(code) + cse.end;
      })
      .replace(encode || skip, function (m, code) {
        return cse.startencode + unescape(code) + cse.end;
      })
      .replace(conditional || skip, function (m, elsecase, code) {
        return elsecase
          ? code
            ? "';}else if(" + unescape(code) + "){out+='"
            : "';}else{out+='"
          : code
          ? "';if(" + unescape(code) + "){out+='"
          : "';}out+='";
      })
      .replace(iterate || skip, function (m, iterate, vname, iname) {
        if (!iterate) return "';} } out+='";
        sid += 1;
        indv = iname || "i" + sid;
        iterate = unescape(iterate);
        return (
          "';var arr" +
          sid +
          "=" +
          iterate +
          ";if(arr" +
          sid +
          "){var " +
          vname +
          "," +
          indv +
          "=-1,l" +
          sid +
          "=arr" +
          sid +
          ".length-1;while(" +
          indv +
          "<l" +
          sid +
          "){" +
          vname +
          "=arr" +
          sid +
          "[" +
          indv +
          "+=1];out+='"
        );
      })
      .replace(evaluate || skip, function (m, code) {
        return "';" + unescape(code) + "out+='";
      }) +
    "';return out;"
  )
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r")
    .replace(/(\s|;|\}|^|\{)out\+='';/g, "$1")
    .replace(/\+''/g, "");
  //.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

  try {
    return new Function(varname, functionBody) as renderTemplate<Data>;
  } catch (e) {
    if (__DEV__) {
      console.warn(
        "[@knitkode/core-render] Could not create a template function: " +
          functionBody
      );
    }
    throw e;
  }
}
