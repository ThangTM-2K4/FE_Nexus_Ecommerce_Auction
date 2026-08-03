import AuctionIntro from '../../components/auctionIntro';

/** Trang test cô lập — chỉ dùng để debug video intro, không tích hợp flow auction. */
export default function AuctionIntroTestPage() {
  return (
    <AuctionIntro
      onFinish={() => console.log('[AuctionIntroTest] Intro finished')}
    />
  );
}
