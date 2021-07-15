<div {{ $attributes->merge(['class' => 'media media--player']) }}>
  <span class="mediaProportion" style="padding-top: {{ ($height * 100) / $width }}%"></span>
  <div
    class="mediaElement bg {{ $classBg ?? '' }}"
    @if(isset($bgColor))style="background:{{ $bgColor }}"@endif
  >
  </div>
  <video
    class="mediaElement player video-js"
    data-setup="{}"
    title="{{ $alt ?? '' }}"
    src="{{ $video['src'] }}"
    @if($video['poster']) poster="{{ $video['poster'] }}"@endif
    @if($width) width="{{ $width }}"@endif
    @if($height) height="{{ $height }}"@endif
    style="
      @if(isset($bgColor))background:{{ $bgColor }};@endif
      @if ($width && !$fullwidth) max-width:{{ $width }}px;@endif
      @if ($width && $fixed)width:{{ $width }}px;max-width:{{ $width }}px;@endif
      {!! $styles ?? '' !!}
    "
    {!! $attrs ?? '' !!}
  >
    <source src="{{ $video['src'] }}" type="video/mp4">
    <p class="vjs-no-js">
      To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="https://videojs.com/html5-video-support/" target="_blank" rel="noopener">supports HTML5 video</a>
    </p>
  </video>
</div>
