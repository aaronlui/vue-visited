const config = {
  name: 'visitedData',
  className: 'is-visited',
  expires: 0
}

const vueVisited = {
  config,
  visitedData: {}
}

function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

function addClass(el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.setAttribute('class', curClass)
  }
}

const trim = function(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

function removeClass(el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.setAttribute('class', trim(curClass))
  }
}

vueVisited.install = function(Vue, options) {
  vueVisited.config = Object.assign({}, vueVisited.config, options)

  vueVisited.visitedData = getVisitedData()

  function getVisitedData() {
    const { name } = vueVisited.config
    const str = localStorage.getItem(name)
    if (!str) return {}

    const data = JSON.parse(str)

    const now = new Date().getTime()

    if (data.expires && now > data.expires) {
      localStorage.removeItem(name)
      return {}
    }

    return data
  }

  function setVisitedData(data, page, key, id) {
    const { name, expires } = vueVisited.config
    if (!data || !page || !key || !id) return

    if (!data[page]) {
      data[page] = {}
    }
    if (!data[page][key]) {
      data[page][key] = []
    }
    // 如果没有就push
    if (!data[page][key].includes(id)) {
      data[page][key].push(id)
    }

    data.expires = expires && typeof expires === 'number' ? new Date().getTime() + expires * 24 * 60 * 60 * 1000 : ''
    localStorage.setItem(name, JSON.stringify(data))
  }

  Vue.prototype.$getVisitedData = () => {
    return vueVisited.visitedData
  }

  Vue.prototype.$setVisitedData = ({ page, key, id }) => {
    setVisitedData(vueVisited.visitedData, page, key, id)
  }

  Vue.directive('visited', {
    inserted(el, binding) {
      const { value, modifiers } = binding
      const { page, key, id } = value
      const { noClick } = modifiers
      const { className } = vueVisited.config

      if (page && key && id) {
        if (vueVisited.visitedData[page] && vueVisited.visitedData[page][key] && vueVisited.visitedData[page][key].includes(id)) {
          addClass(el, className)
        } else {
          removeClass(el, className)
        }

        el.onclick = function() {
          if (!noClick) {
            setVisitedData(vueVisited.visitedData, page, key, id)
            addClass(el, className)
          }
        }
      } else {
        throw new Error(`need options! Like v-visted="{ page: 'page', key: 'key', id: 'id' }"`)
      }
    },
    update(el, binding) {
      const { value, modifiers } = binding
      const { page, key, id } = value
      const { noClick } = modifiers
      const { className } = vueVisited.config

      if (page && key && id) {
        if (vueVisited.visitedData[page] && vueVisited.visitedData[page][key] && vueVisited.visitedData[page][key].includes(id)) {
          addClass(el, className)
        } else {
          removeClass(el, className)
        }

        el.onclick = function() {
          if (!noClick) {
            setVisitedData(vueVisited.visitedData, page, key, id)
            addClass(el, className)
          }
        }
      } else {
        throw new Error(`need options! Like v-visted="{ page: 'page', key: 'key', id: 'id' }"`)
      }
    }
  })
}

export default vueVisited
