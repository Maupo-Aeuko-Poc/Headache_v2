/**
 * Image assets generated based on the PDF references for "Headache"
 */
import menuPortraitUrl from '../assets/images/menu_portrait_rugged_1789136352896.jpg';
import weepingWoodsUrl from '../assets/images/weeping_woods_bg_1789132124341.jpg';
import nightBarnUrl from '../assets/images/night_barn_bg_1789132141993.jpg';
import cathedralTeethUrl from '../assets/images/cathedral_teeth_bg_1789132170294.jpg';
import eldritchOrbUrl from '../assets/images/eldritch_glass_orb_1789132190280.jpg';
import protagonistUrl from '../assets/images/protagonist_runner_1789132246730.jpg';
import threeHeadHoundUrl from '../assets/images/three_head_hound_1789132264862.jpg';
import platformRootsUrl from '../assets/images/platform_roots_soil_1789133261717.jpg';
import platformStoneUrl from '../assets/images/platform_stone_slabs_1789133283579.jpg';
import liminalDoorsUrl from '../assets/images/biome_liminal_doors_1789133304130.jpg';
import clockworkGearUrl from '../assets/images/biome_clockwork_gear_1789133326271.jpg';
import monsterNineArmsUrl from '../assets/images/monster_nine_arms_1789133349909.jpg';
import riddleGateCrestUrl from '../assets/images/riddle_gate_crest_1789133370184.jpg';
import cutscenePanel1Url from '../assets/images/cutscene_panel_1_mirror_1789136373626.jpg';
import cutscenePanel2Url from '../assets/images/cutscene_panel_2_punch_1789136394643.jpg';
import cutscenePanel3Url from '../assets/images/cutscene_panel_3_step_1789136411525.jpg';
import cutscenePanel4Url from '../assets/images/cutscene_panel_4_crouch_1789136432228.jpg';
import cutscenePanel5Url from '../assets/images/cutscene_panel_5_abyss_1789136450200.jpg';

export const IMAGE_URLS = {
  menuPortrait: menuPortraitUrl,
  weepingWoods: weepingWoodsUrl,
  nightBarn: nightBarnUrl,
  cathedralTeeth: cathedralTeethUrl,
  eldritchOrb: eldritchOrbUrl,
  protagonist: protagonistUrl,
  threeHeadHound: threeHeadHoundUrl,
  platformRoots: platformRootsUrl,
  platformStone: platformStoneUrl,
  liminalDoors: liminalDoorsUrl,
  clockworkGear: clockworkGearUrl,
  monsterNineArms: monsterNineArmsUrl,
  riddleGateCrest: riddleGateCrestUrl,
  cutscenePanel1: cutscenePanel1Url,
  cutscenePanel2: cutscenePanel2Url,
  cutscenePanel3: cutscenePanel3Url,
  cutscenePanel4: cutscenePanel4Url,
  cutscenePanel5: cutscenePanel5Url
};

export class ImageAssetLoader {
  private static instance: ImageAssetLoader;
  public images: Map<string, HTMLImageElement> = new Map();
  public loadedCount: number = 0;
  public isReady: boolean = false;

  private constructor() {
    this.preloadAll();
  }

  public static get(): ImageAssetLoader {
    if (!ImageAssetLoader.instance) {
      ImageAssetLoader.instance = new ImageAssetLoader();
    }
    return ImageAssetLoader.instance;
  }

  private preloadAll() {
    const entries = Object.entries(IMAGE_URLS);
    entries.forEach(([key, url]) => {
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.src = url;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount >= entries.length) {
          this.isReady = true;
        }
      };
      this.images.set(key, img);
    });
  }

  public getImage(key: keyof typeof IMAGE_URLS): HTMLImageElement | null {
    const img = this.images.get(key);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }
}

export const assetLoader = ImageAssetLoader.get();
