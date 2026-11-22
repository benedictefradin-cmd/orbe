import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  allerAuProfil,
  groupe,
  inscrire,
  pagePrete,
  parcoursConsultation,
  remplirProfil,
  sansDebordement,
  tabJusqua,
} from "./aides";

test.describe("accueil", () => {
  test("trois entrées qui mènent chacune à sa page", async ({ page }) => {
    for (const [nom, chemin] of [
      ["Les avancées d'hier et les enjeux de demain", "/contexte"],
      ["Je veux participer à la consultation citoyenne", "/consultation"],
      ["Je veux participer aux ateliers", "/ateliers"],
    ] as const) {
      await page.goto("/");
      await page.getByRole("link", { name: nom }).click();
      await expect(page).toHaveURL(new RegExp(`${chemin}$`));
    }
  });

  test("messages d'erreur en français sous chaque champ", async ({ page }) => {
    await page.goto("/ateliers");
    await page.getByRole("button", { name: "Je m'inscris" }).click();
    await expect(page.locator("#prenom-erreur")).toHaveText("Indiquez votre prénom.");
    await expect(page.locator("#champ-prenom")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#ateliers-erreur")).toHaveText("Choisissez au moins une date.");
    await expect(page.getByRole("alert").first()).toBeVisible();
  });
});

test.describe("parcours complets", () => {
  test("consultation de bout en bout", async ({ page }) => {
    const duree = await parcoursConsultation(
      page,
      "Une mesure sur le suivi des victimes devenues adultes",
    );
    test.info().annotations.push({
      type: "durée machine",
      description: `${Math.round(duree / 1000)} s, dont 21 s d'attente anti robots`,
    });
    // Écran de fin : rappel des priorités, suite de la démarche, aide, ateliers, partage.
    await expect(page.getByRole("heading", { name: "Vos 5 priorités" })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Vos 5 priorités" }).getByRole("listitem"),
    ).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "Et maintenant" })).toBeVisible();
    await expect(page.getByText(/Vous êtes la \d+e personne/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Appeler le 119/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Appeler le 116 006/ }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Allez plus loin : rejoignez un atelier de réflexion en décembre",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Je découvre les ateliers" })).toHaveAttribute(
      "href",
      "/ateliers",
    );
    await expect(page.getByRole("heading", { name: "Faites circuler" })).toBeVisible();
    await sansDebordement(page);

    await page.getByLabel("Votre email").fill(`suite.${Date.now()}@exemple.fr`);
    await page.waitForTimeout(3_500);
    await page.getByRole("button", { name: "Je veux connaître la suite" }).click();
    await expect(
      page.getByText("C'est noté. Nous vous écrirons pour la restitution."),
    ).toBeVisible();

    // Une seule réponse par navigateur : en revenant, le formulaire ne s'affiche plus.
    await page.goto("/consultation");
    await expect(
      page.getByRole("heading", { name: "Merci pour votre participation" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuer" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Je veux connaître la suite" })).toBeVisible();
  });

  test("ateliers, deux dates, agenda et annulation", async ({ page }) => {
    await inscrire(page, { ateliers: ["Atelier 1", "Atelier 2"] });
    await expect(page.getByText("lundi 14 décembre de 16h30 à 18h")).toBeVisible();
    await expect(page.getByText("vendredi 18 décembre de 12h30 à 14h")).toBeVisible();
    const lien = await page.getByLabel("Votre lien personnel d'annulation").inputValue();
    expect(lien).toMatch(/\/annuler\/[0-9a-f-]{36}$/);

    const telechargement = page.waitForEvent("download");
    await page.getByRole("button", { name: "Ajouter à mon agenda" }).click();
    const fichier = await telechargement;
    const ics = (await readFile((await fichier.path())!, "utf8")).replace(/\r\n /g, "");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain(lien);
    expect(ics).toContain(
      "Le lien de la visio vous sera envoyé par l'Institut Rousseau avant l'atelier.",
    );

    await page.goto(new URL(lien).pathname);
    await expect(page.getByText("Bonjour Camille, vous ne pouvez plus venir ?")).toBeVisible();
    await page.getByRole("button", { name: "J'annule mon inscription" }).click();
    await expect(page.getByText("C'est annulé. Merci d'avoir libéré votre place.")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Cette inscription est déjà annulée.")).toBeVisible();
  });

  test("refuse un envoi trop rapide, sans enregistrer", async ({ page }) => {
    await page.goto("/ateliers");
    await pagePrete(page, "Je m'inscris");
    await page.getByRole("checkbox", { name: /Atelier 1/ }).check();
    await page.getByRole("textbox", { name: "Prénom (obligatoire)" }).fill("Robot");
    await page.getByRole("textbox", { name: "Nom (obligatoire)", exact: true }).fill("Rapide");
    await page.getByRole("textbox", { name: /^Email/ }).fill(`robot.${Date.now()}@exemple.fr`);
    await page.getByLabel("J'ai 18 ans ou plus").check();
    await page.getByLabel(/J'accepte que l'Institut Rousseau/).check();
    await page.getByRole("button", { name: "Je m'inscris" }).click();
    await expect(page.getByText(/un peu vite/)).toBeVisible();
    await expect(page.getByRole("heading", { name: /C'est noté/ })).toHaveCount(0);
  });
});

test.describe("navigation au clavier", () => {
  test("de l'accueil au classement, sans souris", async ({ page }, info) => {
    test.skip(info.project.name !== "ordinateur-1280", "clavier testé sur ordinateur");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu" })).toBeFocused();
    const cta = page.getByRole("link", { name: "Je veux participer à la consultation citoyenne" });
    await tabJusqua(page, cta);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/consultation$/);
    await pagePrete(page, "Continuer");
    const premiere = page.locator("button.mesure").first();
    await tabJusqua(page, premiere);
    await page.keyboard.press("Enter");
    await expect(premiere).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/^Ajoutée en position 1 sur 5 : /)).toHaveCount(1);
    await expect(premiere).toBeFocused();
    const continuer = page.getByRole("button", { name: "Continuer" });
    await tabJusqua(page, continuer);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert").first()).toBeFocused();
  });
});

test.describe("redevabilité", () => {
  test("la méthode est accessible depuis la consultation", async ({ page }) => {
    await page.goto("/consultation");
    await pagePrete(page, "Continuer");
    await page.getByRole("link", { name: "Comment vos réponses sont analysées" }).click();
    await expect(page).toHaveURL(/\/methode$/);
    await expect(
      page.getByRole("heading", { name: "La méthode de la consultation", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/méthode de Borda/)).toBeVisible();
    await expect(page.getByText(/pas un échantillon représentatif/)).toBeVisible();
  });

  test("les résultats ne sont pas publics tant que le réglage est désactivé", async ({
    request,
  }) => {
    const r = await request.get("/resultats");
    expect(r.status()).toBe(404);
    expect(await r.text()).not.toContain("Les résultats de la consultation");
  });
});

test.describe("questionnaire v2", () => {
  test("ordre gardé au retour, mesures classées absentes des mesures non soutenues", async ({
    page,
  }) => {
    await page.goto("/consultation");
    await pagePrete(page, "Continuer");
    const mesures = page.locator("button.mesure");
    await expect(mesures).toHaveCount(24);
    for (const i of [0, 5, 7, 9, 11]) await mesures.nth(i).click();
    const textes = await mesures.allTextContents();
    await page.getByRole("button", { name: "Continuer" }).click();
    const rejet = groupe(page, /ne soutenez pas/);
    await expect(rejet.getByRole("checkbox")).toHaveCount(19);
    for (let i = 0; i < 3; i++) await rejet.getByRole("checkbox").nth(i).click();
    const quatrieme = rejet.getByRole("checkbox").nth(3);
    await expect(quatrieme).toHaveAttribute("aria-disabled", "true");
    // Au clavier, la case reste atteignable mais ne se coche pas.
    await quatrieme.focus();
    await page.keyboard.press("Space");
    await expect(quatrieme).toBeFocused();
    await expect(rejet.getByRole("checkbox", { checked: true })).toHaveCount(3);
    await page.getByRole("button", { name: "Retour" }).click();
    expect(await mesures.allTextContents()).toEqual(textes);
  });

  test("moins de 15 ans : message bienveillant, 119, rien n'est envoyé", async ({ page }) => {
    let envois = 0;
    page.on("request", (r) => {
      if (r.method() === "POST" && r.url().includes("_serverFn")) envois++;
    });
    await page.goto("/consultation");
    await pagePrete(page, "Continuer");
    await expect(page.getByText("Ouvert à partir de 15 ans.")).toBeVisible();
    await allerAuProfil(page);
    await groupe(page, "Votre âge").getByLabel("Moins de 15 ans").check();
    await expect(page.getByText(/ouverte à partir de 15 ans/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Appeler le 119" })).toHaveAttribute(
      "href",
      "tel:119",
    );
    await expect(page.getByRole("button", { name: "Continuer" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Je valide mes réponses" })).toHaveCount(0);
    expect(envois).toBe(0);
  });

  test("« personne concernée » demande un accord explicite, retiré si on décoche", async ({
    page,
  }) => {
    await page.goto("/consultation");
    await pagePrete(page, "Continuer");
    await allerAuProfil(page);
    const accord = page.getByLabel(/J'accepte que cette information, anonyme/);
    const concerne = groupe(page, "Votre lien avec le sujet").getByLabel(
      /Je suis une personne concernée/,
    );
    await expect(accord).toHaveCount(0);
    await remplirProfil(page);
    await concerne.check();
    await expect(accord).toBeVisible();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.locator("#consentementConcerne-erreur")).toContainText("case d'accord");
    await accord.check();
    await page.getByRole("button", { name: "Continuer" }).click();
    await expect(page.getByRole("heading", { name: "Relecture", level: 2 })).toBeFocused();
    await expect(page.getByText(/Accord donné pour les statistiques/)).toBeVisible();
    await page.getByRole("button", { name: "Retour" }).click();
    await concerne.uncheck();
    await expect(accord).toHaveCount(0);
  });
});

test.describe("dates simulées", () => {
  test("le lendemain du jour J moins 3 à 0 h 00, les inscriptions sont closes", async ({
    page,
  }) => {
    await page.goto("http://localhost:3201/ateliers");
    await expect(
      page.getByText("Les inscriptions aux ateliers sont closes. Merci pour votre intérêt."),
    ).toBeVisible();
    // La consultation ferme le même jour que les inscriptions.
    await expect(page.getByRole("link", { name: "Je réponds à la consultation" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Je m'inscris" })).toHaveCount(0);
    await page.goto("http://localhost:3201/");
    await expect(page.getByRole("link", { name: "Je veux participer aux ateliers" })).toHaveCount(
      0,
    );
    await expect(page.getByText("Inscriptions closes")).toBeVisible();
  });

  test("le serveur refuse une inscription envoyée directement après fermeture", async ({
    page,
    request,
  }, info) => {
    test.skip(info.project.name !== "ordinateur-1280", "un seul passage suffit");
    // On capture un vrai envoi sur le serveur ouvert, puis on le rejoue tel quel sur le serveur fermé.
    let envoi: { url: string; corps: string; entetes: Record<string, string> } | null = null;
    page.on("request", (r) => {
      if (
        r.method() === "POST" &&
        r.url().includes("_serverFn") &&
        (r.postData() ?? "").includes("prenom")
      )
        envoi = { url: r.url(), corps: r.postData() ?? "", entetes: r.headers() };
    });
    await inscrire(page);
    expect(envoi).not.toBeNull();
    const { url, corps, entetes } = envoi!;
    const chemin = new URL(url).pathname + new URL(url).search;
    const avecEmailNeuf = corps.replace(
      /camille\.[^"]+@exemple\.fr/,
      `rejoue.${Date.now()}@exemple.fr`,
    );
    const reponse = await request.post(`http://localhost:3201${chemin}`, {
      data: avecEmailNeuf,
      headers: {
        ...entetes,
        origin: "http://localhost:3201",
        referer: "http://localhost:3201/ateliers",
        host: "localhost:3201",
      },
    });
    const texte = await reponse.text();
    expect(texte).toContain("closes");
    expect(texte).not.toContain('"ok":true');
  });

  test("après la clôture, la consultation est close", async ({ page }) => {
    await page.goto("http://localhost:3202/consultation");
    await expect(
      page
        .getByText(
          "La consultation est close. Merci pour votre participation. La synthèse sera présentée en février 2027.",
        )
        .first(),
    ).toBeVisible();
    await page.goto("http://localhost:3202/");
    await expect(
      page.getByRole("link", { name: "Je veux participer à la consultation citoyenne" }),
    ).toHaveCount(0);
    await expect(
      page
        .getByText(
          "La consultation est close. Merci pour votre participation. La synthèse sera présentée en février 2027.",
        )
        .first(),
    ).toBeVisible();
  });
});

test.describe("mise en page et accessibilité", () => {
  for (const largeur of [360, 768, 1280]) {
    test(`aucun débordement à ${largeur} px`, async ({ page }) => {
      await page.setViewportSize({ width: largeur, height: 900 });
      for (const chemin of [
        "/",
        "/contexte",
        "/consultation",
        "/ateliers",
        "/donnees-personnelles",
        "/methode",
        "/admin",
      ]) {
        await page.goto(chemin);
        await page.waitForLoadState("networkidle");
        await sansDebordement(page);
      }
    });
  }

  test("contraste AA et règles WCAG sur les pages principales", async ({ page }) => {
    for (const chemin of [
      "/",
      "/contexte",
      "/consultation",
      "/ateliers",
      "/donnees-personnelles",
      "/methode",
    ]) {
      await page.goto(chemin);
      await page.waitForLoadState("networkidle");
      const r = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        r.violations.map(
          (v) => `${chemin} ${v.id} ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
        ),
      ).toEqual([]);
    }
  });

  test("cibles tactiles de 44 px minimum", async ({ page }) => {
    await page.goto("/");
    const petites = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "main a.bouton, main button, header button, header a.bouton",
        ),
      ]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ t: el.textContent?.trim(), h: el.getBoundingClientRect().height }))
        .filter((x) => x.h < 44),
    );
    expect(petites).toEqual([]);
  });
});

test.describe("tableau de bord", () => {
  test("se met à jour seul en moins de 30 secondes après une nouvelle inscription", async ({
    page,
    browser,
  }, info) => {
    test.skip(info.project.name !== "ordinateur-1280", "un seul passage suffit");
    await page.goto("/admin");
    await page.getByLabel("Identifiant").fill("organisatrice");
    await page.getByLabel("Mot de passe").fill("e2e-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
    const lireTotal = async () =>
      Number((await page.getByText(/^Ateliers, \d+ personnes$/).textContent())?.match(/\d+/)?.[0]);
    const avant = await lireTotal();

    const autre = await browser.newPage();
    await inscrire(autre);
    const inscritLe = Date.now();
    await expect.poll(lireTotal, { timeout: 32_000, intervals: [1000] }).toBe(avant + 1);
    expect(Date.now() - inscritLe).toBeLessThan(31_000);

    const consultationAvant = Number(
      (await page.getByText(/^Consultation, \d+ réponses$/).textContent())?.match(/\d+/)?.[0],
    );
    await parcoursConsultation(autre);
    await expect
      .poll(
        async () =>
          Number(
            (await page.getByText(/^Consultation, \d+ réponses$/).textContent())?.match(/\d+/)?.[0],
          ),
        { timeout: 32_000, intervals: [1000] },
      )
      .toBe(consultationAvant + 1);
    await autre.close();

    await page.getByRole("tab", { name: "Consultation" }).click();
    await expect(page.getByText("Classement des 24 mesures, en direct")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Score par thème" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Réponses strictement identiques" }),
    ).toBeVisible();
    await page.getByLabel("Version du questionnaire").selectOption("v1");
    await expect(page.getByText(/^0 réponses retenues sur \d+/)).toBeVisible();
    await page.getByLabel("Version du questionnaire").selectOption("toutes");

    const telechargement = page.waitForEvent("download");
    await page.getByRole("button", { name: "Télécharger les réponses (.xlsx)" }).click();
    expect((await telechargement).suggestedFilename()).toMatch(
      /^reponses-consultation-\d{4}-\d{2}-\d{2}\.xlsx$/,
    );
    const t2 = page.waitForEvent("download");
    await page.getByRole("button", { name: "Télécharger les inscriptions (.xlsx)" }).click();
    expect((await t2).suggestedFilename()).toMatch(
      /^inscriptions-ateliers-\d{4}-\d{2}-\d{2}\.xlsx$/,
    );

    await page.getByRole("button", { name: "Se déconnecter" }).click();
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Se connecter" })).toBeVisible();
  });

  test("refuse un mauvais mot de passe", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Identifiant").fill("organisatrice");
    await page.getByLabel("Mot de passe").fill("faux");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Identifiant ou mot de passe incorrect.")).toBeVisible();
  });
});

test("liste d'attente, puis montée automatique après annulation", async ({
  page,
  browser,
}, info) => {
  test.skip(info.project.name !== "ordinateur-1280", "un seul passage suffit");
  test.setTimeout(600_000);
  // Remplit l'atelier 2 jusqu'à la capacité, en parallèle pour aller plus vite.
  await page.goto("/ateliers");
  await pagePrete(page, "Je m'inscris");
  const texte = await page
    .getByRole("checkbox", { name: /Atelier 2/ })
    .locator("xpath=ancestor::label")
    .textContent();
  let restantes = Number(texte?.match(/(\d+) places? restantes?/)?.[1] ?? 0);
  const premiere = await browser.newPage();
  await inscrire(premiere, { ateliers: ["Atelier 2"], email: "premiere@exemple.fr" });
  const lienPremiere = await premiere.getByLabel("Votre lien personnel d'annulation").inputValue();
  restantes -= 1;
  while (restantes > 0) {
    const lot = Math.min(restantes, 6);
    await Promise.all(
      Array.from({ length: lot }, async () => {
        const p = await browser.newPage();
        await inscrire(p, { ateliers: ["Atelier 2"] });
        await p.close();
      }),
    );
    restantes -= lot;
  }
  const attente = await browser.newPage();
  await attente.goto("/ateliers");
  await expect(attente.getByText("Complet (liste d'attente)")).toBeVisible();
  await inscrire(attente, { ateliers: ["Atelier 2"], email: "attente@exemple.fr" });
  await expect(attente.getByText(/Liste d'attente\. Nous vous écrirons/)).toBeVisible();

  await premiere.goto(new URL(lienPremiere).pathname);
  await premiere.getByRole("button", { name: "J'annule mon inscription" }).click();
  await expect(premiere.getByText(/C'est annulé/)).toBeVisible();

  await page.goto("/admin");
  await page.getByLabel("Identifiant").fill("organisatrice");
  await page.getByLabel("Mot de passe").fill("e2e-mot-de-passe");
  await page.getByRole("button", { name: "Se connecter" }).click();
  const prevenir = page.getByRole("region", { name: /À prévenir/ });
  await expect(prevenir.getByText("attente@exemple.fr")).toBeVisible();
});
