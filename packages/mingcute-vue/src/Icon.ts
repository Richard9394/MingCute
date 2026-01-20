import { defineComponent, h, type PropType, type VNode } from 'vue';

export const Icon = defineComponent({
  name: 'Icon',
  props: {
    size: {
      type: [Number, String] as PropType<number | string>,
      default: 24,
    },
    color: {
      type: String,
      default: 'currentColor',
    },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          width: props.size,
          height: props.size,
          viewBox: '0 0 24 24',
          style: { color: props.color },
          ...attrs,
        },
        slots.default?.()
      );
  },
});
