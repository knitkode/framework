<div {{ $attributes->merge(['class' => 'media media--video']) }}>
  <span class="mediaProportion" style="padding-top: {{ ($height * 100) / $width }}%"></span>
  <div
    class="mediaElement bg {{ $classBg ?? '' }}"
    @if(isset($bgColor))style="background:{{ $bgColor }}"@endif
  >
  </div>
  <video
    title="{{ $alt ?? '' }}"
    src="{{ $video['src'] }}"
    poster="{{ $video['poster'] }}"
    class="mediaElement video"
    width="{{ $width }}"
    height="{{ $height }}"
    style="
      @if(isset($bgColor))background:{{ $bgColor }};@endif
      @if ($width && !$fullwidth) max-width:{{ $width }}px;@endif
      @if ($width && $fixed)width:{{ $width }}px;max-width:{{ $width }}px;@endif
      {!! $styles ?? '' !!}
    "
    {!! $attrs ?? '' !!}
  >
    {{--
    <source src="{{ $video['src'] }}.mp4" type="video/mp4">
    <source src="{{ $video['src'] }}.webm" type="video/webm">
    <source src="{{ $video['src'] }}.ogg" type="video/ogg">
    --}}
    <noscript>
      To view this video please enable JavaScript, and consider upgrading to a web browser that
      <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
    </noscript>
  </video>
</div>
