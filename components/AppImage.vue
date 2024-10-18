<script lang="ts" setup>
import { isNotNullOrUndefined } from "~/utils/checks";

type AspectRatio = "1/1" | "2/1" | "16/9"; // Also add them in the template
export interface Props {
  src?: string;
  alt?: string;
  caption?: string;
  /**
   * Percentile part of the screen width
   */
  partOfScreen?: number;
  partOfScreenExtraSmall?: number;
  partOfScreenSmall?: number;
  partOfScreenMedium?: number;
  partOfScreenLarge?: number;
  partOfScreenExtraLarge?: number;
  partOfScreen2ExtraLarge?: number;
  /**
   * The aspect ratio of the image
   */
  aspectRatio?: AspectRatio;
  aspectRatioExtraSmall?: AspectRatio;
  aspectRatioSmall?: AspectRatio;
  aspectRatioMedium?: AspectRatio;
  aspectRatioLarge?: AspectRatio;
  aspectRatioExtraLarge?: AspectRatio;
  aspectRatio2ExtraLarge?: AspectRatio;
  /**
   * If you need to override the partOfScreen and set the sizes directly
   */
  sizes?: string;
  class?: any;
}
const props = defineProps<Props>();

const id = useId();
const imgClass = computed(() => {
  const ratios = [
    isNullOrUndefined(props.aspectRatio) ? null : `aspect-${props.aspectRatio}`,
    isNullOrUndefined(props.aspectRatioExtraSmall)
      ? null
      : `xs:aspect-${props.aspectRatioExtraSmall}`,
    isNullOrUndefined(props.aspectRatioSmall)
      ? null
      : `sm:aspect-${props.aspectRatioSmall}`,
    isNullOrUndefined(props.aspectRatioMedium)
      ? null
      : `md:aspect-${props.aspectRatioMedium}`,
    isNullOrUndefined(props.aspectRatioLarge)
      ? null
      : `lg:aspect-${props.aspectRatioLarge}`,
    isNullOrUndefined(props.aspectRatioExtraLarge)
      ? null
      : `xl:aspect-${props.aspectRatioExtraLarge}`,
    isNullOrUndefined(props.aspectRatio2ExtraLarge)
      ? null
      : `xxl:aspect-${props.aspectRatio2ExtraLarge}`,
  ].filter(isNotNullOrUndefined);

  // Add a default aspect ratio if none is provided
  if (ratios.length === 0) {
    ratios.push("aspect-1/1");
  }

  return [props.class, ratios.join(" "), "bg-slate-200 object-cover"]
    .filter(isNotNullOrUndefinedOrEmpty)
    .join(" ");
});

const imgSizes = computed(() => {
  if (isNotNullOrUndefined(props.sizes)) return props.sizes;

  const _sizes: { [key in ScreenSize]: number | undefined } = {
    xs: !isNumber(props.partOfScreenExtraSmall)
      ? props.partOfScreen
      : props.partOfScreenExtraSmall,
    sm: !isNumber(props.partOfScreenSmall)
      ? props.partOfScreen
      : props.partOfScreenSmall,
    md: !isNumber(props.partOfScreenMedium)
      ? props.partOfScreen
      : props.partOfScreenMedium,
    lg: !isNumber(props.partOfScreenLarge)
      ? props.partOfScreen
      : props.partOfScreenLarge,
    xl: !isNumber(props.partOfScreenExtraLarge)
      ? props.partOfScreen
      : props.partOfScreenExtraLarge,
    xxl: !isNumber(props.partOfScreen2ExtraLarge)
      ? props.partOfScreen
      : props.partOfScreen2ExtraLarge,
  };

  return Object.entries(_sizes)
    .map(([key, value]) => {
      if (isNullOrUndefined(value)) return null;

      return `${key}:${Math.round(value * screensUntil[key as ScreenSize])}px`;
    })
    .filter(isNotNullOrUndefined)
    .join(" ");
});
</script>

<template>
  <figure
    v-if="src"
    itemscope
    itemtype="https://schema.org/ImageObject"
    itemprop="image"
  >
    <NuxtPicture
      :src="src"
      :alt="alt"
      :sizes="imgSizes"
      :imgAttrs="{
        itemprop: 'thumbnailUrl',
        'aria-describedby': caption ? `${id}_figcaption` : undefined,
        class: imgClass,
      }"
    />
    <div v-if="false">
      <!-- Added the aspect ratio's to force tailwind to generate them, this way we don't need to safelist them -->
      <div
        class="xs:aspect-16/9 xxl:aspect-16/9 aspect-16/9 sm:aspect-16/9 md:aspect-16/9 lg:aspect-16/9 xl:aspect-16/9"
      />
      <div
        class="xs:aspect-2/1 xxl:aspect-2/1 aspect-2/1 sm:aspect-2/1 md:aspect-2/1 lg:aspect-2/1 xl:aspect-2/1"
      />
      <div
        class="xs:aspect-1/1 xxl:aspect-1/1 aspect-1/1 sm:aspect-1/1 md:aspect-1/1 lg:aspect-1/1 xl:aspect-1/1"
      />
    </div>
    <figcaption v-if="caption" :id="`${id}_figcaption`">
      {{ caption }}
    </figcaption>
  </figure>
  <figure v-else>
    <div :class="imgClass" />
  </figure>
</template>
