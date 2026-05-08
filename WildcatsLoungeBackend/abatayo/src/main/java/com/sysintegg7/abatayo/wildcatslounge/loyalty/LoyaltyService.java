package com.sysintegg7.abatayo.wildcatslounge.loyalty;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterEntity;
import com.sysintegg7.abatayo.wildcatslounge.RegistrationPage.RegisterRepository;

@Service
public class LoyaltyService {

    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final CouponRepository couponRepository;
    private final RegisterRepository registerRepository;

    public LoyaltyService(LoyaltyPointsRepository loyaltyPointsRepository,
                          LoyaltyTransactionRepository loyaltyTransactionRepository,
                          CouponRepository couponRepository,
                          RegisterRepository registerRepository) {
        this.loyaltyPointsRepository = loyaltyPointsRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.couponRepository = couponRepository;
        this.registerRepository = registerRepository;
    }

    public LoyaltyStatusDTO getStatus(String email) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        List<LoyaltyTransactionDTO> tx = loyaltyTransactionRepository
            .findByUserOrderByIdDesc(user)
                .stream()
                .limit(20)
                .map(t -> new LoyaltyTransactionDTO(
                t.getPointsEarned() - t.getPointsRedeemed(),
                        t.getTransactionType(),
                t.getPointsRedeemed() > 0 ? "Redeemed points" : "Points earned",
                        t.getCreatedAt()
                ))
                .toList();

        return new LoyaltyStatusDTO(user.getEmail(), pointsEntity.getPoints(), tx);
    }

    public LoyaltyStatusDTO redeem(String email, Integer pointsToRedeem) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        if (pointsEntity.getPoints() < pointsToRedeem) {
            return null;
        }

        pointsEntity.setPoints(pointsEntity.getPoints() - pointsToRedeem);
        loyaltyPointsRepository.save(pointsEntity);

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity();
        tx.setUser(user);
        tx.setOrder(null);
        tx.setPointsEarned(0);
        tx.setPointsRedeemed(pointsToRedeem);
        tx.setTransactionType("POINTS_REDEEMED");
        tx.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        loyaltyTransactionRepository.save(tx);

        return getStatus(email);
    }

    public void addPoints(RegisterEntity user, Integer points, String type, String note) {
        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        pointsEntity.setPoints(pointsEntity.getPoints() + points);
        loyaltyPointsRepository.save(pointsEntity);

        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity();
        tx.setUser(user);
        tx.setOrder(null);
        tx.setPointsEarned(points);
        tx.setPointsRedeemed(0);
        tx.setTransactionType(type);
        tx.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        loyaltyTransactionRepository.save(tx);
    }

    private LoyaltyPointsEntity getOrCreatePoints(RegisterEntity user) {
        return loyaltyPointsRepository.findByUser(user)
                .orElseGet(() -> loyaltyPointsRepository.save(new LoyaltyPointsEntity(null, user, 0)));
    }

    public CouponDTO generateCoupon(String email, Integer pointsToSpend) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }

        LoyaltyPointsEntity pointsEntity = getOrCreatePoints(user);
        if (pointsEntity.getPoints() < pointsToSpend) {
            return null;
        }

        // Deduct points and create coupon
        pointsEntity.setPoints(pointsEntity.getPoints() - pointsToSpend);
        loyaltyPointsRepository.save(pointsEntity);

        // Generate coupon code
        String couponCode = "WL-" + System.currentTimeMillis() + "-" + user.getId();
        Integer discountAmount = calculateDiscount(pointsToSpend);
        
        CouponEntity coupon = new CouponEntity();
        coupon.setUser(user);
        coupon.setCode(couponCode);
        coupon.setDiscountAmount(discountAmount);
        coupon.setPointsCost(pointsToSpend);
        coupon.setUsed(false);
        
        // Set expiry to 30 days from now
        long expiryTime = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000);
        coupon.setExpiryDate(String.valueOf(expiryTime));

        CouponEntity savedCoupon = couponRepository.save(coupon);

        // Record transaction
        LoyaltyTransactionEntity tx = new LoyaltyTransactionEntity();
        tx.setUser(user);
        tx.setOrder(null);
        tx.setPointsEarned(0);
        tx.setPointsRedeemed(pointsToSpend);
        tx.setTransactionType("COUPON_GENERATED");
        tx.setCreatedAt(String.valueOf(System.currentTimeMillis()));
        loyaltyTransactionRepository.save(tx);

        return new CouponDTO(savedCoupon.getId(), couponCode, discountAmount, pointsToSpend, false, coupon.getExpiryDate());
    }

    private Integer calculateDiscount(Integer points) {
        // Example: every 10 points = 50 pesos discount
        return (points / 10) * 50;
    }

    public List<CouponDTO> getAvailableCoupons(String email) {
        RegisterEntity user = registerRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        return couponRepository
                .findByUserAndIsUsedFalse(user)
                .stream()
                .map(c -> new CouponDTO(c.getId(), c.getCode(), c.getDiscountAmount(), 
                        c.getPointsCost(), c.isUsed(), c.getExpiryDate()))
                .toList();
    }

    public boolean applyCoupon(String couponCode) {
        java.util.Optional<CouponEntity> couponOpt = couponRepository.findByCode(couponCode);
        
        if (couponOpt.isEmpty()) {
            return false;
        }

        CouponEntity coupon = couponOpt.get();
        if (coupon.isUsed()) {
            return false;
        }

        long expiryTime = Long.parseLong(coupon.getExpiryDate());
        if (expiryTime < System.currentTimeMillis()) {
            return false;
        }

        coupon.setUsed(true);
        couponRepository.save(coupon);
        
        return true;
    }
}
