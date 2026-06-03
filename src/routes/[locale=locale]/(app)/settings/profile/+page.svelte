<script lang="ts">
  import { untrack } from "svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import type { PageServerData } from "./$types";
  import { LL, locale } from "$lib/i18n/i18n-svelte";
  import { saveUserInfo } from "../../data.remote";
  import { userInfoSchema } from "../../schema";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card/index.js";
  import { toast } from "svelte-sonner";
  import { route } from "$lib/ROUTES";
  import WrapTranslation from "$lib/components/wrap-translation.svelte";

  let { data }: { data: PageServerData } = $props();

  // Initialize form fields once when component mounts
  // Using untrack to prevent re-running when form fields change
  $effect(() => {
    untrack(() => {
      saveUserInfo.fields.set({
        firstNames: data.user.firstNames ?? "",
        lastName: data.user.lastName ?? "",
        homeMunicipality: data.user.homeMunicipality ?? "",
      });
    });
  });

  // Track if form has been validated (after first blur or submit attempt)
  // "Reward early, validate late" pattern
  let hasValidated = $state(false);

  function handleBlur() {
    hasValidated = true;
    saveUserInfo.validate();
  }

  function handleInput() {
    // Only validate on input after initial validation
    if (hasValidated) {
      saveUserInfo.validate();
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{$LL.settings.profile.title()}</Card.Title>
    <Card.Description>{$LL.settings.profile.description()}</Card.Description>
  </Card.Header>
  <Card.Content>
    <form
      {...saveUserInfo.preflight(userInfoSchema).enhance(async ({ submit }) => {
        try {
          await submit();
          toast.success($LL.user.saveSuccess());
        } catch {
          toast.error($LL.user.saveError());
        }
      })}
      class="flex flex-col gap-4"
    >
      <div class="space-y-2">
        <Label>
          {#snippet child({ props })}
            <span {...props}>{$LL.user.email()}</span>
          {/snippet}
        </Label>
        <p class="text-sm text-muted-foreground">
          <WrapTranslation message={$LL.settings.profile.emailManagement()}>
            {#snippet children(infix)}
              <a
                href={route("/[locale=locale]/settings/emails", { locale: $locale })}
                class="text-primary underline underline-offset-4 hover:text-primary/80">{infix}</a
              >
            {/snippet}
          </WrapTranslation>
        </p>
      </div>

      <div class="space-y-2">
        <Label for="firstNames">{$LL.user.firstNames()}</Label>
        <Input
          {...saveUserInfo.fields.firstNames.as("text")}
          id="firstNames"
          autocomplete="given-name"
          onblur={handleBlur}
          oninput={handleInput}
          data-testid="firstNames-input"
        />
        {#each saveUserInfo.fields.firstNames.issues() as issue, i (i)}
          <p class="text-sm text-destructive" data-testid="firstNames-error">{issue.message}</p>
        {/each}
      </div>

      <div class="space-y-2">
        <Label for="lastName">{$LL.user.lastName()}</Label>
        <Input
          {...saveUserInfo.fields.lastName.as("text")}
          id="lastName"
          autocomplete="family-name"
          onblur={handleBlur}
          oninput={handleInput}
          data-testid="lastName-input"
        />
        {#each saveUserInfo.fields.lastName.issues() as issue, i (i)}
          <p class="text-sm text-destructive" data-testid="lastName-error">{issue.message}</p>
        {/each}
      </div>

      <div class="space-y-2">
        <Label for="homeMunicipality">{$LL.user.homeMunicipality()}</Label>
        <Input
          {...saveUserInfo.fields.homeMunicipality.as("text")}
          id="homeMunicipality"
          autocomplete="address-level2"
          onblur={handleBlur}
          oninput={handleInput}
          data-testid="homeMunicipality-input"
        />
        {#each saveUserInfo.fields.homeMunicipality.issues() as issue, i (i)}
          <p class="text-sm text-destructive" data-testid="homeMunicipality-error">{issue.message}</p>
        {/each}
      </div>

      <Button type="submit" disabled={!!saveUserInfo.pending}>{$LL.common.save()}</Button>
    </form>
  </Card.Content>
</Card.Root>
