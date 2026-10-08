/* BERTH.A RC333 — FINAL Solar renderer
   Runs after rc239-runtime-clean.js.
   Touches ONLY Solar pet/accessory artwork.
   Does NOT alter medals, trophies, capsule, progress or other universes. */
(() => {
  'use strict';

  const VERSION = '333';

  const PETS = Object.freeze({
    solar_lion_cute: 'lion',
    solar_phoenix_cute: 'phoenix',
    solar_dragon_cute: 'dragon',
    solar_lizard_cute: 'lizard',
    solar_mystic_cute: 'mystic',
    solar_bee_cute: 'bee'
  });

  const ACC = Object.freeze({
    solar_acc_crown: 1,
    solar_acc_collar: 2,
    solar_acc_glasses: 3,
    solar_acc_backpack: 4,
    solar_acc_badge: 5
  });

  const VARIANT = Object.freeze({
    '0': '',
    '1': '_coral',
    '2': '_misto'
  });

  const PET_SRC = id => {
    const key = PETS[id];
    return key ? `rc316_solar_${key}.png?v=${VERSION}` : '';
  };

  const ACC_SRC = (petId, accId, variant='0') => {
    const key = PETS[petId];
    const slot = ACC[accId];
    if (!key || !slot) return '';
    return `rc316_solar_${key}_acc${slot}${VARIANT[String(variant)] ?? ''}.png?v=${VERSION}`;
  };

  function makeImg(src, cls='') {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'eager';
    img.decoding = 'async';
    img.className = `rc333-solar-img ${cls}`.trim();
    img.setAttribute('data-rc333-solar', '1');
    img.style.setProperty('width','100%','important');
    img.style.setProperty('height','100%','important');
    img.style.setProperty('max-width','100%','important');
    img.style.setProperty('max-height','100%','important');
    img.style.setProperty('object-fit','contain','important');
    img.style.setProperty('object-position','center center','important');
    img.style.setProperty('display','block','important');
    img.style.setProperty('background','transparent','important');
    img.style.setProperty('border-radius','0','important');
    img.style.setProperty('box-shadow','none','important');
    img.style.setProperty('transform','none','important');
    img.style.setProperty('padding','0','important');
    return img;
  }

  function currentSolarPet(root=document) {
    const active = root.querySelector('.r197-pets button[data-r152pet].active, .r175-pets button[data-r152pet].active');
    if (active && PETS[active.dataset.r152pet]) return active.dataset.r152pet;

    const selected = root.querySelector('#r152Pet');
    if (selected && PETS[selected.value]) return selected.value;

    const any = root.querySelector('.r197-pets button[data-r152pet], .r175-pets button[data-r152pet]');
    if (any && PETS[any.dataset.r152pet]) return any.dataset.r152pet;

    return null;
  }

  function currentVariant(card, accId) {
    const active = card.querySelector(`button[data-aid="${accId}"].active[data-rc209variant]`);
    if (active) return active.dataset.rc209variant || '0';

    const any = card.querySelector(`button[data-aid="${accId}"][data-rc209variant]`);
    return any?.dataset.rc209variant || '0';
  }

  function patchPetCards(root=document) {
    root.querySelectorAll('.r197-pets button[data-r152pet], .r175-pets button[data-r152pet]').forEach(btn => {
      const id = btn.dataset.r152pet;
      if (!PETS[id]) return;

      const src = PET_SRC(id);
      const holder =
        btn.querySelector('.r197-pet-art') ||
        btn.querySelector('span') ||
        btn;

      let img = holder.querySelector('img[data-rc333-solar]');
      if (!img) {
        holder.replaceChildren();
        img = makeImg(src, 'rc333-solar-pet');
        holder.appendChild(img);
      } else if (img.getAttribute('src') !== src) {
        img.src = src;
      }

      holder.style.setProperty('background','transparent','important');
      holder.style.setProperty('box-shadow','none','important');
      holder.style.setProperty('border','0','important');
    });
  }

  function patchHero(root=document) {
    const petId = currentSolarPet(root);
    if (!petId) return;

    const shell = root.querySelector('.rc209-kids-shell, .r197-kids-shell');
    if (!shell) return;

    const hero = shell.querySelector('.r197-current-art');
    if (!hero) return;

    const src = PET_SRC(petId);
    let img = hero.querySelector('img[data-rc333-solar]');
    if (!img) {
      hero.replaceChildren();
      img = makeImg(src, 'rc333-solar-hero');
      hero.appendChild(img);
    } else if (img.getAttribute('src') !== src) {
      img.src = src;
    }

    hero.style.setProperty('background','transparent','important');
    hero.style.setProperty('box-shadow','none','important');
  }

  function patchAccessoryCards(root=document) {
    const petId = currentSolarPet(root);
    if (!petId) return;

    root.querySelectorAll('.r197-acc').forEach(card => {
      const btn = card.querySelector('button[data-aid][data-rc209variant]');
      const accId = btn?.dataset.aid;
      if (!ACC[accId]) return;

      const variant = currentVariant(card, accId);
      const src = ACC_SRC(petId, accId, variant);
      const holder = card.querySelector('.r197-acc-art');
      if (!holder) return;

      let img = holder.querySelector('img[data-rc333-solar]');
      if (!img) {
        holder.replaceChildren();
        img = makeImg(src, 'rc333-solar-accessory');
        holder.appendChild(img);
      } else if (img.getAttribute('src') !== src) {
        img.src = src;
      }

      holder.style.setProperty('background','transparent','important');
      holder.style.setProperty('box-shadow','none','important');
      holder.style.setProperty('border','0','important');
    });

    // Covers proxy wrappers introduced by later Kids patches.
    root.querySelectorAll('.rc209-acc-proxy[data-acc]').forEach(proxy => {
      const accId = proxy.dataset.acc;
      if (!ACC[accId]) return;

      const card = proxy.closest('.r197-acc') || proxy.parentElement;
      const variant = card ? currentVariant(card, accId) : '0';
      const src = ACC_SRC(petId, accId, variant);

      let img = proxy.querySelector('img[data-rc333-solar]');
      if (!img) {
        proxy.replaceChildren();
        img = makeImg(src, 'rc333-solar-accessory');
        proxy.appendChild(img);
      } else if (img.getAttribute('src') !== src) {
        img.src = src;
      }

      proxy.style.setProperty('background','transparent','important');
      proxy.style.setProperty('box-shadow','none','important');
      proxy.style.setProperty('border','0','important');
    });
  }

  function wireVariantClicks(root=document) {
    root.querySelectorAll('button[data-aid][data-rc209variant]').forEach(btn => {
      if (btn.dataset.rc333Wired === '1') return;
      if (!ACC[btn.dataset.aid]) return;

      btn.dataset.rc333Wired = '1';
      btn.addEventListener('click', () => {
        const card = btn.closest('.r197-acc');
        const petId = currentSolarPet(document);
        if (!card || !petId) return;

        const accId = btn.dataset.aid;
        const src = ACC_SRC(petId, accId, btn.dataset.rc209variant || '0');

        const holder = card.querySelector('.r197-acc-art');
        if (holder) {
          holder.replaceChildren(makeImg(src, 'rc333-solar-accessory'));
        }

        const proxy = card.querySelector('.rc209-acc-proxy[data-acc]');
        if (proxy) {
          proxy.replaceChildren(makeImg(src, 'rc333-solar-accessory'));
        }
      }, true);
    });
  }

  function wirePetClicks(root=document) {
    root.querySelectorAll('.r197-pets button[data-r152pet], .r175-pets button[data-r152pet]').forEach(btn => {
      if (btn.dataset.rc333PetWired === '1') return;
      if (!PETS[btn.dataset.r152pet]) return;

      btn.dataset.rc333PetWired = '1';
      btn.addEventListener('click', () => {
        setTimeout(apply, 0);
        setTimeout(apply, 30);
        setTimeout(apply, 120);
      }, true);
    });
  }

  function apply() {
    patchPetCards(document);
    patchHero(document);
    patchAccessoryCards(document);
    wireVariantClicks(document);
    wirePetClicks(document);
    document.documentElement.dataset.berthaSolarRenderer = 'RC333';
  }

  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      apply();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {childList:true, subtree:true});

  document.addEventListener('click', () => {
    setTimeout(apply, 0);
    setTimeout(apply, 40);
    setTimeout(apply, 160);
  }, true);

  window.addEventListener('pageshow', apply);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, {once:true});
  } else {
    apply();
  }

  [100, 300, 700, 1200, 2200, 4000].forEach(ms => setTimeout(apply, ms));
})();
