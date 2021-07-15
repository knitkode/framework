@props([
  'src' => '',
  'width' => 0,
  'height' => 0,
  'progress' => 42
])
<div class="media media--iframe">
  <span class="mediaProportion" style="padding-top: {{ ($height * 100) / $width }}%"></span>
  <iframe
    src="{{ $src }}"
    class="mediaElement iframe lazy"
    width="{{ $width }}"
    height="{{ $height }}" 
    frameborder="0" 
    style="border:0"
    allowfullscreen
  ></iframe>
  @progressCircular(['size' => $progress, 'center' => true ])
</div>
