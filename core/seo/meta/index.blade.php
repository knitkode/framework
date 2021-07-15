@props([
  'data' => [], // the CmsApi data, overridable from a route controller
])
@php
  $seo =  $data['seo'] ?? false;
  $metaTitle= $metaTitle ?? $seo['meta_title'] ?? '';
  $metaDescription = $metaDescription ?? $seo['meta_description'] ?? '';
  $metaKeywords = $metaKeywords ?? $seo['meta_keywords'] ?? '';
  $ogTitle = $ogTitle ?? $seo['og_title'] ?? '';
  $ogDesc = $ogDesc ?? $seo['og_desc'] ?? '';
  $ogImg = $ogImg ?? $seo['og_img'] ?? '';
  $follow = $follow ?? $seo['follow'] ?? '';
  $index = $index ?? $seo['index'] ?? '';
@endphp

@if($metaTitle)
  <title>{{ $metaTitle}}</title>
@endif
@if($metaDescription)
  <meta name="description" content="{{ $metaDescription }}">
@endif
{{-- print even if empty --}}
<meta name="keywords" content="{{ $metaKeywords }}">
@if($follow != 'nofollow' && ($ogTitle || $metaTitle))
  <meta property="og:title" content="{{ $ogTitle ? $ogTitle : $metaTitle }}">
@endif
@if($ogDesc || $metaDescription)
  <meta property="og:description" content="{{ $ogDesc ? $ogDesc : $metaDescription }}">
@endif
@if($ogImg)
  <meta property="og:image" content="{{ media($ogImg) }}">
@endif
<meta property="og:locale" content="{{ $locale }}">
<meta name="robots" content="{{ $index }}, {{ $follow }}">

@if(isset($i18n['locales']) && count($i18n['locales']) > 1)
  @foreach ($langs as $lang)
    <link rel="alternate" hreflang="{{ $lang['locale'] }}" href="{{ $lang['url'] }}">
    @if ($lang['locale'] == $i18n['default_locale'])
      <link rel="alternate" hreflang="x-default" href="{{ $lang['url'] }}">
    @endif
  @endforeach
@endif
