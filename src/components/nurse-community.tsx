import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import {
  COMMUNITY_GROUPS,
  COMMUNITY_NURSES,
  COMMUNITY_POSTS,
  STORIES,
  testimonialVersions,
  useCommunity,
  type CommunityNurse,
  type ExperienceReview,
  type NurseStory,
} from "@/lib/community-data";
import { cn } from "@/lib/utils";

const EMPTY_RATINGS: ExperienceReview["ratings"] = {
  team: 0,
  onboarding: 0,
  workload: 0,
  housing: 0,
  island: 0,
  community: 0,
};

const RATING_LABELS: { key: keyof ExperienceReview["ratings"]; label: string }[] = [
  { key: "team", label: "Hospital team support" },
  { key: "onboarding", label: "Arrival & onboarding" },
  { key: "workload", label: "Workload expectations" },
  { key: "housing", label: "Housing experience" },
  { key: "island", label: "Island & partner perks" },
  { key: "community", label: "Sense of community" },
];

export function NurseCommunity({
  embedded = false,
  passportProgress = 0,
  onEditProfile,
  onPassportAction,
}: {
  embedded?: boolean;
  passportProgress?: number;
  onEditProfile?: () => void;
  onPassportAction?: () => void;
} = {}) {
  const { t: tr } = useLanguage();
  const { state, update } = useCommunity();
  const [query, setQuery] = useState("");
  const [storyFilter, setStoryFilter] = useState("All stories");
  const [story, setStory] = useState<NurseStory | null>(null);
  const [profile, setProfile] = useState<CommunityNurse | null>(null);
  const [postText, setPostText] = useState("");
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [testimonialLength, setTestimonialLength] = useState<"short" | "medium" | "social">("medium");
  const [review, setReview] = useState<ExperienceReview>(
    state.review ?? {
      hospital: "Hospital Wilma N. Vázquez",
      location: "Dorado",
      assignment: "Emergency Room · 4 weeks",
      ratings: EMPTY_RATINGS,
      highlight: "",
      advice: "",
      recommend: true,
      returnAgain: true,
      status: "draft",
      testimonialApproved: false,
    },
  );

  useEffect(() => {
    if (state.review) setReview(state.review);
  }, [state.review]);

  const visibleGroups = COMMUNITY_GROUPS.filter((group) =>
    `${group.name} ${group.description} ${group.tag}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredStories = STORIES.filter((item) => storyFilter === "All stories" || item.type === storyFilter);
  const versions = testimonialVersions(review);

  function toggleList(key: "joinedGroups" | "connections" | "likedPosts" | "team", id: string) {
    update((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id],
    }));
  }

  function saveReview(status: "draft" | "published") {
    const next = { ...review, status };
    setReview(next);
    update((current) => ({ ...current, review: next }));
    toast.success(tr(status === "published" ? "Experience review published." : "Review draft saved."));
    if (status === "published") setTestimonialOpen(true);
  }

  async function copyTestimonial() {
    await navigator.clipboard.writeText(versions[testimonialLength]);
    toast.success(tr("Testimonial copied."));
  }

  function downloadTestimonial() {
    const text = versions[testimonialLength].replace(/[&<>]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character] ?? character);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><rect width="1200" height="1200" fill="#092D37"/><circle cx="1040" cy="160" r="95" fill="#16C9AD" opacity=".22"/><text x="90" y="130" fill="#16C9AD" font-family="Arial" font-size="30" font-weight="700">WEPA.CARE · ISLAND NURSE STORY</text><foreignObject x="90" y="220" width="1020" height="600"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial;color:#F5F2E9;font-size:52px;line-height:1.25;font-weight:700">“${text}”</div></foreignObject><text x="90" y="1020" fill="#F5F2E9" font-family="Arial" font-size="34" font-weight="700">Elena Rivera · Emergency Room</text><text x="90" y="1070" fill="#FF7563" font-family="Arial" font-size="28">${review.location} · Synthetic demo story</text></svg>`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    link.download = "wepa-island-nurse-story.svg";
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(tr("Social story downloaded."));
  }

  return (
    <main className={cn("bg-background text-foreground", embedded ? "-mx-4 -my-6" : "min-h-screen pb-16")}>
      {!embedded && <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="icon" aria-label={tr("Back to nurse home")}>
            <Link to="/" search={{ home: "nurse" }}><ArrowLeft /></Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase text-primary">{tr("Nurse community")}</p>
            <p className="truncate text-sm font-black">{tr("Find your people before you land")}</p>
          </div>
          <LanguageToggle />
        </div>
      </header>}

      <section className="bg-surface-dark text-surface-dark-foreground">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:px-8 lg:py-14">
          <div>
            <Badge className="bg-primary text-primary-foreground">{tr("Part of your Readiness Passport")}</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">{tr("Build your Passport. Find your people.")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-surface-dark-foreground/80 sm:text-lg">{tr("Complete your profile and island interests to meet nurses headed your way, join a group, and build a travel team around matching gigs.")}</p>
            {embedded && <div className="mt-6 flex flex-wrap items-center gap-3"><Button onClick={onPassportAction}>{passportProgress < 100 ? tr("Continue building my Passport") : tr("Review my Passport")}<ChevronRight /></Button><Button variant="outline" onClick={onEditProfile} className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground">{tr("Complete my profile")}</Button><span className="text-sm font-bold text-primary">{passportProgress}% {tr("Passport complete")}</span></div>}
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-surface-dark-foreground/20 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <CommunityStat value="120" label={tr("nurses in the demo pool")} />
            <CommunityStat value="6" label={tr("active groups")} />
            <CommunityStat value="24" label={tr("open to a buddy")} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="community">
          <TabsList className="grid h-auto w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="community"><Users className="mr-2 size-4" />{tr("Community")}</TabsTrigger>
            <TabsTrigger value="stories"><Star className="mr-2 size-4" />{tr("Stories")}</TabsTrigger>
            <TabsTrigger value="review"><Sparkles className="mr-2 size-4" />{tr("My review")}</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-8 space-y-12">
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">{tr("Find your circle")}</p>
                  <h2 className="mt-1 text-3xl font-black">{tr("Groups that make the first hello easier")}</h2>
                </div>
                <div className="relative sm:w-80">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tr("Search by place, specialty, or travel style")} className="pl-9" />
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visibleGroups.map((group) => {
                  const joined = state.joinedGroups.includes(group.id);
                  return (
                    <article key={group.id} className="border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-3"><Badge variant="secondary">{tr(group.tag)}</Badge><span className="text-xs text-muted-foreground">{group.members + (joined ? 1 : 0)} {tr("members")}</span></div>
                      <h3 className="mt-4 text-xl font-black">{tr(group.name)}</h3>
                      <p className="mt-2 min-h-16 text-sm leading-relaxed text-muted-foreground">{tr(group.description)}</p>
                      <Button variant={joined ? "outline" : "default"} className="mt-4 w-full" onClick={() => toggleList("joinedGroups", group.id)}>{joined ? <><Check />{tr("Joined")}</> : <><Users />{tr("Join group")}</>}</Button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <p className="eyebrow">{tr("Community feed")}</p>
                <h2 className="mt-1 text-3xl font-black">{tr("Plans, questions, and open invitations")}</h2>
                <div className="mt-5 border border-border bg-card p-4">
                  <Textarea value={postText} onChange={(event) => setPostText(event.target.value)} placeholder={tr("Share a question or invite the community along…")} />
                  <div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{tr("Posted to your joined groups")}</span><Button size="sm" disabled={!postText.trim()} onClick={() => { setPostText(""); toast.success(tr("Demo post shared.")); }}><Send />{tr("Post")}</Button></div>
                </div>
                <div className="mt-4 space-y-4">
                  {COMMUNITY_POSTS.map((post) => {
                    const nurse = COMMUNITY_NURSES.find((item) => item.id === post.nurseId);
                    if (!nurse) return null;
                    const liked = state.likedPosts.includes(post.id);
                    return (
                      <article key={post.id} className="border border-border bg-card p-5">
                        <button type="button" onClick={() => setProfile(nurse)} className="flex text-left">
                          <img src={nurse.photo} alt={nurse.name} loading="lazy" width={512} height={512} className="size-12 rounded-full object-cover" />
                          <span className="ml-3"><span className="block font-bold">{nurse.name}</span><span className="block text-xs text-muted-foreground">{tr(post.group)} · {tr(post.time)}</span></span>
                        </button>
                        <p className="mt-4 text-sm leading-relaxed">{tr(post.text)}</p>
                        <div className="mt-4 flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleList("likedPosts", post.id)} className={cn(liked && "text-coral")}><Heart className={cn(liked && "fill-current")} />{post.likes + (liked ? 1 : 0)}</Button>
                          <Button variant="ghost" size="sm" onClick={() => toast.info(tr("Demo conversation opened."))}><MessageCircle />{post.replies}</Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside>
                <div className="border border-border bg-secondary/30 p-5">
                  <div className="flex items-start gap-3"><Checkbox checked={state.openToBuddy} onCheckedChange={() => update((current) => ({ ...current, openToBuddy: !current.openToBuddy }))} id="buddy" /><label htmlFor="buddy"><span className="block font-black">{tr("Open to a travel buddy")}</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{tr("A low-pressure signal for nurses who would rather meet one person before joining a group.")}</span></label></div>
                </div>
                <p className="eyebrow mt-7">{tr("Suggested people")}</p>
                <div className="mt-3 space-y-3">
                  {COMMUNITY_NURSES.slice(1, 5).map((nurse) => {
                    const connected = state.connections.includes(nurse.id);
                    const teamed = state.team.includes(nurse.id);
                    return (
                      <article key={nurse.id} className="flex items-center gap-3 border border-border bg-card p-3">
                        <button type="button" onClick={() => setProfile(nurse)} className="shrink-0"><img src={nurse.photo} alt={nurse.name} loading="lazy" width={512} height={512} className="size-14 rounded-full object-cover" /></button>
                        <button type="button" onClick={() => setProfile(nurse)} className="min-w-0 flex-1 text-left"><span className="block truncate font-bold">{nurse.name}</span><span className="block truncate text-xs text-muted-foreground">{tr(nurse.specialty)} · {nurse.location}</span></button>
                        <Button size="icon" variant={connected ? "secondary" : "outline"} aria-label={tr(connected ? "Connected" : "Connect")} onClick={() => toggleList("connections", nurse.id)}>{connected ? <Check /> : <Users />}</Button>
                        <Button size="icon" variant={teamed ? "default" : "ghost"} aria-label={tr(teamed ? "Remove from team" : "Add to travel team")} onClick={() => toggleList("team", nurse.id)}><Heart className={cn(teamed && "fill-current")} /></Button>
                      </article>
                    );
                  })}
                </div>
                {state.team.length > 0 && <div className="mt-5 border-l-4 border-primary bg-primary/10 p-4"><p className="font-black">{tr("Your travel team")}</p><p className="mt-1 text-sm text-muted-foreground">{state.team.map((id) => COMMUNITY_NURSES.find((nurse) => nurse.id === id)?.name).filter(Boolean).join(" · ")}</p><Button className="mt-3" size="sm" onClick={() => toast.success(tr("Demo team chat started."))}><MessageCircle />{tr("Start team chat")}</Button></div>}
              </aside>
            </section>
          </TabsContent>

          <TabsContent value="stories" className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">{tr("Nurse stories")}</p><h2 className="mt-1 text-3xl font-black">{tr("The assignment—and the life around it")}</h2><p className="mt-2 text-sm text-muted-foreground">{tr("Synthetic demo testimonials based on fictional assignments and nurses.")}</p></div><select value={storyFilter} onChange={(event) => setStoryFilter(event.target.value)} className="h-10 rounded-md border border-input bg-card px-3 text-sm">{["All stories", "Metro", "Coastal", "Rural", "Family", "Service"].map((type) => <option key={type} value={type}>{tr(type)}</option>)}</select></div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredStories.map((item) => <StoryCard key={item.id} story={item} onOpen={() => setStory(item)} />)}
            </div>
          </TabsContent>

          <TabsContent value="review" className="mt-8">
            <section className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
              <div><p className="eyebrow">{tr("Your experience")}</p><h2 className="mt-1 text-3xl font-black">{tr("Turn what happened into something useful")}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr("Review the full assignment—clinical support, housing, island life, and community. Then choose whether WEPA may turn your own words into a testimonial.")}</p><div className="mt-6 border-l-4 border-coral bg-coral/10 p-4 text-sm"><strong>{tr("You stay in control.")}</strong> {tr("Nothing becomes a shareable testimonial until you review and approve it.")}</div></div>
              <ReviewEditor review={review} setReview={setReview} onSave={saveReview} onBuild={() => { saveReview("published"); setTestimonialOpen(true); }} />
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <StoryDialog story={story} onClose={() => setStory(null)} />
      <ProfileDialog nurse={profile} connected={profile ? state.connections.includes(profile.id) : false} onConnect={() => profile && toggleList("connections", profile.id)} onClose={() => setProfile(null)} />
      <Dialog open={testimonialOpen} onOpenChange={setTestimonialOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{tr("Create your testimonial")}</DialogTitle><DialogDescription>{tr("Built only from your review. Approve the wording before sharing.")}</DialogDescription></DialogHeader>
          <div className="grid grid-cols-3 gap-2">{(["short", "medium", "social"] as const).map((length) => <Button key={length} variant={testimonialLength === length ? "default" : "outline"} onClick={() => setTestimonialLength(length)}>{tr(length === "short" ? "Short" : length === "medium" ? "Story" : "Social")}</Button>)}</div>
          <div className="bg-surface-dark p-6 text-surface-dark-foreground"><div className="flex items-center gap-3"><img src={COMMUNITY_NURSES.at(0)?.photo} alt="Elena Rivera" width={512} height={512} className="size-14 rounded-full object-cover" /><div><p className="font-black">Elena Rivera</p><p className="text-xs text-surface-dark-foreground/65">{tr("Emergency Room")} · {review.location}</p></div></div><blockquote className="mt-5 text-xl font-bold leading-relaxed">“{tr(versions[testimonialLength])}”</blockquote><p className="mt-5 text-xs uppercase text-primary">{tr("Synthetic demo testimonial · nurse approval required")}</p></div>
          <label className="flex items-start gap-3 text-sm"><Checkbox checked={review.testimonialApproved} onCheckedChange={(checked) => { const next = { ...review, testimonialApproved: checked === true }; setReview(next); update((current) => ({ ...current, review: next })); }} /><span>{tr("I approve this wording for WEPA.care, social profiles, and recruiting materials.")}</span></label>
          <div className="grid gap-2 sm:grid-cols-2"><Button variant="outline" disabled={!review.testimonialApproved} onClick={() => void copyTestimonial()}><Copy />{tr("Copy testimonial")}</Button><Button disabled={!review.testimonialApproved} onClick={downloadTestimonial}><Download />{tr("Download social story")}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function CommunityStat({ value, label }: { value: string; label: string }) { return <div><p className="text-2xl font-black text-primary sm:text-3xl">{value}</p><p className="mt-1 text-xs leading-tight text-surface-dark-foreground/65">{label}</p></div>; }

export function NurseStorySpotlight() {
  const { t: tr } = useLanguage();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % STORIES.length), 7000);
    return () => window.clearInterval(timer);
  }, []);
  const story = STORIES[index];
  if (!story) return null;
  const nurse = COMMUNITY_NURSES.find((item) => item.id === story.nurseId);
  if (!nurse) return null;
  return <section className="overflow-hidden bg-surface-dark text-surface-dark-foreground"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[.72fr_1.28fr]"><div className="relative min-h-80 lg:min-h-[34rem]"><img src={nurse.photo} alt={nurse.name} width={512} height={512} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-surface-dark" /></div><div className="flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-14"><p className="eyebrow text-primary">{tr("Your Passport opens the island community")}</p><div className="mt-5 flex text-coral">{Array.from({ length: story.rating }, (_, i) => <Star key={i} className="size-4 fill-current" />)}</div><blockquote className="mt-4 max-w-3xl text-2xl font-black leading-tight sm:text-4xl">“{tr(story.quote)}”</blockquote><div className="mt-5"><p className="font-bold">{nurse.name} · {tr(nurse.specialty)}</p><p className="text-sm text-surface-dark-foreground/65">{story.hospital} · {story.location}</p></div><div className="mt-7 flex flex-wrap items-center gap-3"><Button asChild><Link to="/ready" search={{ section: "community" }}>{tr("Build your Passport & meet nurses")}<ChevronRight /></Link></Button><Button variant="outline" size="icon" className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground" aria-label={tr("Previous story")} onClick={() => setIndex((index - 1 + STORIES.length) % STORIES.length)}><ChevronLeft /></Button><Button variant="outline" size="icon" className="border-surface-dark-foreground/30 bg-transparent text-surface-dark-foreground hover:bg-surface-dark-foreground/10 hover:text-surface-dark-foreground" aria-label={tr("Next story")} onClick={() => setIndex((index + 1) % STORIES.length)}><ChevronRight /></Button></div><p className="mt-5 text-xs text-surface-dark-foreground/45">{tr("Synthetic nurse and testimonial for MVP demonstration.")}</p></div></div></section>;
}

function StoryCard({ story, onOpen }: { story: NurseStory; onOpen: () => void }) { const { t: tr } = useLanguage(); const nurse = COMMUNITY_NURSES.find((item) => item.id === story.nurseId); if (!nurse) return null; return <article className="overflow-hidden border border-border bg-card"><div className="relative aspect-[4/3]"><img src={nurse.photo} alt={nurse.name} loading="lazy" width={512} height={512} className="h-full w-full object-cover" /><Badge className="absolute left-3 top-3 bg-card text-foreground">{tr(story.type)}</Badge></div><div className="p-5"><div className="flex text-coral">{Array.from({ length: story.rating }, (_, i) => <Star key={i} className="size-3.5 fill-current" />)}</div><blockquote className="mt-3 text-lg font-black leading-snug">“{tr(story.quote)}”</blockquote><p className="mt-4 text-sm font-bold">{nurse.name}</p><p className="text-xs text-muted-foreground">{tr(nurse.specialty)} · {story.location}</p><Button variant="link" className="mt-3 h-auto p-0" onClick={onOpen}>{tr("Read the full story")}<ChevronRight /></Button></div></article>; }

function StoryDialog({ story, onClose }: { story: NurseStory | null; onClose: () => void }) { const { t: tr } = useLanguage(); const nurse = story ? COMMUNITY_NURSES.find((item) => item.id === story.nurseId) : null; return <Dialog open={Boolean(story)} onOpenChange={(open) => !open && onClose()}>{story && nurse && <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><div className="-mx-6 -mt-6 aspect-[16/8] overflow-hidden"><img src={nurse.photo} alt={nurse.name} width={512} height={512} className="h-full w-full object-cover object-[center_30%]" /></div><DialogHeader><div className="flex items-center gap-2"><Badge>{tr(story.type)}</Badge><span className="text-xs text-muted-foreground">{tr("Synthetic demo story")}</span></div><DialogTitle className="text-2xl">{nurse.name} · {story.location}</DialogTitle><DialogDescription>{story.hospital} · {tr(story.assignment)}</DialogDescription></DialogHeader><blockquote className="border-l-4 border-coral pl-4 text-xl font-black">“{tr(story.quote)}”</blockquote><p className="text-sm leading-relaxed">{tr(story.story)}</p><div className="flex flex-wrap gap-2">{story.highlights.map((highlight) => <Badge variant="secondary" key={highlight}>{tr(highlight)}</Badge>)}</div><Button onClick={onClose}>{tr("Close story")}</Button></DialogContent>}</Dialog>; }

function ProfileDialog({ nurse, connected, onConnect, onClose }: { nurse: CommunityNurse | null; connected: boolean; onConnect: () => void; onClose: () => void }) { const { t: tr } = useLanguage(); return <Dialog open={Boolean(nurse)} onOpenChange={(open) => !open && onClose()}>{nurse && <DialogContent><div className="flex items-center gap-4"><img src={nurse.photo} alt={nurse.name} width={512} height={512} className="size-24 rounded-full object-cover" /><div><DialogTitle className="text-2xl">{nurse.name}</DialogTitle><p className="mt-1 text-sm text-muted-foreground">{tr(nurse.specialty)} · {nurse.home}</p><p className="mt-1 flex items-center gap-1 text-sm"><MapPin className="size-4 text-primary" />{nurse.location}</p></div></div><p className="text-sm leading-relaxed">{tr(nurse.bio)}</p><div className="flex flex-wrap gap-2">{nurse.tags.map((tag) => <Badge key={tag} variant="secondary">{tr(tag)}</Badge>)}</div><div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={onClose}>{tr("Close")}</Button><Button onClick={onConnect}>{connected ? <><Check />{tr("Connected")}</> : <><Users />{tr("Connect")}</>}</Button></div></DialogContent>}</Dialog>; }

function ReviewEditor({ review, setReview, onSave, onBuild }: { review: ExperienceReview; setReview: (review: ExperienceReview) => void; onSave: (status: "draft" | "published") => void; onBuild: () => void }) { const { t: tr } = useLanguage(); const complete = Object.values(review.ratings).every(Boolean) && review.highlight.trim() && review.advice.trim(); return <div className="border border-border bg-card p-5 sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label={tr("Hospital or organization")}><Input value={review.hospital} onChange={(event) => setReview({ ...review, hospital: event.target.value })} /></Field><Field label={tr("Location")}><Input value={review.location} onChange={(event) => setReview({ ...review, location: event.target.value })} /></Field></div><div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">{RATING_LABELS.map((item) => <div key={item.key}><p className="text-sm font-bold">{tr(item.label)}</p><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((rating) => <Button key={rating} variant="ghost" size="icon" className="size-8" aria-label={tr(`${rating} stars`)} onClick={() => setReview({ ...review, ratings: { ...review.ratings, [item.key]: rating } })}><Star className={cn("size-5 text-coral", rating <= review.ratings[item.key] && "fill-current")} /></Button>)}</div></div>)}</div><Field label={tr("What should another nurse know?")} className="mt-7"><Textarea value={review.highlight} onChange={(event) => setReview({ ...review, highlight: event.target.value })} placeholder={tr("The moment, support, or island experience that defined the assignment…")} className="min-h-28" /></Field><Field label={tr("Your practical advice")} className="mt-5"><Textarea value={review.advice} onChange={(event) => setReview({ ...review, advice: event.target.value })} placeholder={tr("What would you tell someone arriving next month?")} /></Field><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-3 text-sm"><Checkbox checked={review.recommend} onCheckedChange={(value) => setReview({ ...review, recommend: value === true })} />{tr("I would recommend this experience")}</label><label className="flex items-center gap-3 text-sm"><Checkbox checked={review.returnAgain} onCheckedChange={(value) => setReview({ ...review, returnAgain: value === true })} />{tr("I would return for another assignment")}</label></div><div className="mt-7 grid gap-2 sm:grid-cols-3"><Button variant="outline" onClick={() => onSave("draft")}>{tr("Save draft")}</Button><Button variant="secondary" disabled={!complete} onClick={() => onSave("published")}>{tr("Publish review")}</Button><Button disabled={!complete} onClick={onBuild}><Sparkles />{tr("Create testimonial")}</Button></div></div>; }

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) { return <label className={cn("block", className)}><span className="mb-2 block text-sm font-bold">{label}</span>{children}</label>; }