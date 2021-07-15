<div class="glide__bullets" data-glide-el="controls[nav]">
  @foreach($slider as $slide)
    <button class="glide__bullet" data-glide-dir="={{ $loop->index }}"></button>
  @endforeach
</div>
