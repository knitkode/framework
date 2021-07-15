@props([
  'id' => '',
  'tag' => 'div'
])
<{{ $tag }} data-fragment-id="{{ $id }}" {{ $attributes->merge(['class' => 'fragment']) }}>
  @if(!$slot->isEmpty())
  <div class="fragmentContent">
    {{ $slot ?? '' }}
  </div>
  @endif
</{{ $tag }}>
    