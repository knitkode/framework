@props([
  'data' => [], // the CmsApi data, overridable from a route controller
])
@php
  $seo =  $data['seo'] ?? false;
  $itemtype= $itemtype ?? $seo['itemtype'] ?? '';
@endphp
<body {{ $attributes }}@if($itemtype) itemscope itemtype="https://schema.org/{{ $itemtype }}"@endif>
  {{ $slot }}
</body>
