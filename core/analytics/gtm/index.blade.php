@props([
  'type' => 'header', // or 'body'
  'analytics' => [
    'gtmHeader' => '',
    'gtmBody' => ''
  ]
])

@if ($type == 'header')
  @if ($analytics['gtmHeader'])
    @push('styles')
      <link rel="dns-preconnect" href="https://www.google-analytics.com">
      <link rel="dns-prefetch" href="https://www.google-analytics.com">
    @endpush
    {!! $analytics['gtmHeader'] !!}
  @endif
@endif

@if ($type == 'body')
  @if ($analytics['gtmBody'])
    @push('styles')
      <link rel="dns-preconnect" href="https://www.google-analytics.com">
      <link rel="dns-prefetch" href="https://www.google-analytics.com">
    @endpush
    {!! $analytics['gtmBody'] !!}
  @endif
@endif