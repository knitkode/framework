@props([
  'schema' => false,
  'attr' => '',
  'text' => ''
])
@if($schema)<span itemprop="{{ $attr }}">@endif
{{ $text }}
@if($schema)</span>@endif
