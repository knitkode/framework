@props([
  'src' => '',
  'poster' => '',
  'alt' => '',
  'type' => 'mp4'
])
<video
  data-setup="{}"
  title="{{ $alt ?? '' }}"
  src="{{ media($src) }}"
  @if($poster) poster="{{ media($poster) }}"@endif
  {{ $attributes->merge([ 'class' => 'video-js' ]) }}
>
  <source src="{{ media($src) }}" type="video/{{ $type }}">
  <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener">supports HTML5 video</a>
  </p>
</video>
