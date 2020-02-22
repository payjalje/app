import { img as getImg } from '@ecomplus/utils'
import lozad from 'lozad'

const getBestFitThumb = (picture, containerWidth, containerBreakpoints) => {
  let bestFitThumb, bestFitBreakpoint
  for (const thumb in containerBreakpoints) {
    const thumbBreakpoint = containerBreakpoints[thumb]
    if (thumbBreakpoint !== undefined && picture[thumb]) {
      if (bestFitBreakpoint !== undefined) {
        if (thumbBreakpoint === null) {
          if (bestFitBreakpoint >= containerWidth) {
            continue
          }
        } else if (
          thumbBreakpoint < containerWidth ||
          (bestFitBreakpoint !== null && thumbBreakpoint > bestFitBreakpoint)
        ) {
          continue
        }
      }
      bestFitThumb = thumb
      bestFitBreakpoint = thumbBreakpoint
    }
  }
  return bestFitThumb
}

export default {
  name: 'APicture',

  props: {
    src: [String, Object],
    fallbackSrc: String,
    alt: String,
    fade: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '/assets/img-placeholder.png'
    },
    containerBreakpoints: {
      type: Object,
      default () {
        return {
          zoom: null,
          big: 800,
          normal: 400
        }
      }
    }
  },

  data () {
    return {
      sources: [],
      height: null
    }
  },

  computed: {
    elClasses () {
      return `lozad ${(this.fade ? 'fade' : 'show')}`
    },

    defaultImgObj () {
      return getImg(this.src) || {}
    },

    localFallbackSrc () {
      const { src, defaultImgObj, fallbackSrc } = this
      if (fallbackSrc) {
        return fallbackSrc
      }
      const fixedSrc = typeof src === 'object'
        ? src.zoom
          ? src.zoom.url : defaultImgObj.url
        : src
      return fixedSrc ? fixedSrc.replace(/\.webp$/, '') : this.placeholder
    },

    localAlt () {
      const { alt, src, defaultImgObj } = this
      if (alt) {
        return alt
      } else if (!src) {
        return 'No image'
      }
      return defaultImgObj.alt || 'Product'
    }
  },

  methods: {
    updateSources () {
      const sources = []
      let srcset
      if (typeof this.src === 'object') {
        const { clientWidth } = this.$el
        const imgObj = this.src[getBestFitThumb(this.src, clientWidth, this.containerBreakpoints)]
        const { url, size } = (imgObj || this.defaultImgObj)
        srcset = url
        if (size) {
          const [width, height] = size.split('x').map(px => parseInt(px, 10))
          if (height) {
            this.height = `${(clientWidth >= width ? height : clientWidth * height / width)}px`
          }
        }
      } else {
        srcset = this.src
      }
      if (srcset) {
        if (srcset.endsWith('.webp')) {
          sources.push({
            srcset,
            type: 'image/webp'
          }, {
            srcset: srcset.replace(/\.webp$/, ''),
            type: `image/${(srcset.substr(-9, 4) === 'png' ? 'png' : 'jpeg')}`
          })
        } else {
          sources.push({ srcset })
        }
      }
      this.sources = sources
    }
  },

  mounted () {
    this.updateSources()
    this.$nextTick(() => {
      const $picture = this.$el
      const observer = lozad($picture, {
        rootMargin: '350px 0px',
        threshold: 0,
        loaded: $el => {
          const { localFallbackSrc } = this
          const $img = $el.tagName === 'IMG' ? $el : $el.lastChild
          $img.onerror = function () {
            console.error(new Error('Image load error'), this)
            $el.style.display = 'none'
            const $newImg = document.createElement('IMG')
            $newImg.src = localFallbackSrc
            $el.parentNode.insertBefore($newImg, $el.nextSibling)
          }
          setTimeout(() => $el.classList.add('show', 'loaded'), 100)
        }
      })
      observer.observe()
    })
  }
}