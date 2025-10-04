<?php

namespace App\Form\Type;

use App\Entity\Course;
use App\Entity\CourseRegistration;
use App\Subscriber\HashPasswordSubscriber;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CourseRegistrationType extends AbstractType
{
    public function __construct(
        private readonly HashPasswordSubscriber $subscriber
    )
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {


        $builder->addEventSubscriber($this->subscriber);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => CourseRegistration::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'course_registration_item',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'course_registration';
    }

}